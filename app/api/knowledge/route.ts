import { NextRequest, NextResponse } from 'next/server';
import { loadKnowledgeDocs, saveKnowledgeDoc, deleteKnowledgeDoc, KnowledgeDoc } from '@/lib/utils/knowledge-storage';
import * as cheerio from 'cheerio';

// 텍스트 정제 함수 (LLM 없이도 사용)
function cleanTextFallback(text: string): { title: string; content: string; keywords: string[] } {
  let cleaned = text
    .replace(/\w+@\w+[^\n]*/g, '')
    .replace(/\s+[가-힣]{2,4}\s+기자/g, '')
    .replace(/무단전재[^\n]*/gi, '')
    .replace(/저작권[^\n]*/gi, '')
    .replace(/이 시각 핫클릭 이슈[\s\S]*/g, '')
    .replace(/copyright[^\n]*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const lines = cleaned.split('\n')
    .map(l => l.trim())
    .filter(line => {
      if (line.length < 15) return false;
      if (/^[가-힣]{2,4}\s*기자$/.test(line)) return false;
      if (/무단전재|재배포|copyright/i.test(line)) return false;
      if (/핫클릭|더보기|관련 기사|추천 기사/i.test(line)) return false;
      return true;
    });

  const content = cleaned;
  const allText = cleaned;
  const keywordPatterns = [
    /BGF리테일/g, /CU/g, /GS25/g, /이마트/g, /홈플러스/g,
    /카페/g, /베이커리/g, /평양냉면/g, /밀프렌즈/g,
    /상품기획/g, /전략/g, /협업/g, /지자체/g,
    /프랜차이즈/g, /창업/g, /수익/g
  ];

  const keywords: string[] = [];
  const seen = new Set<string>();

  for (const pattern of keywordPatterns) {
    const matches = allText.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (!seen.has(match)) {
          seen.add(match);
          keywords.push(match);
        }
      }
    }
  }

  const defaultKeywords = ['BGF리테일', 'CU', '카페', '베이커리', '협업'];
  let idx = 0;
  while (keywords.length < 5 && idx < defaultKeywords.length) {
    if (!seen.has(defaultKeywords[idx])) {
      keywords.push(defaultKeywords[idx]);
      seen.add(defaultKeywords[idx]);
    }
    idx++;
  }

  return {
    title: lines[0]?.substring(0, 50) || '웹 문서',
    content,
    keywords: keywords.slice(0, 5)
  };
}

function extractKeywordsFromContent(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);

  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'of', 'for', 'with', 'as',
    '이', '그', '저', '것', '의', '를', '을', '에', '에서', '와', '과', '하다', '되다', '이다',
    '및', '등', '수', '위', '통해', '경우', '때', '그리고', '하지만', '그러나'
  ]);

  const filteredWords = words.filter(word => !stopWords.has(word));
  const wordCount = new Map<string, number>();
  filteredWords.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

async function fetchWebContent(url: string): Promise<{ title: string; content: string; keywords: string[] }> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    if (!response.ok) throw new Error('Failed to fetch URL');

    const html = await response.text();
    const $ = cheerio.load(html);

    const rawTitle = $('meta[property="og:title"]').attr('content') ||
                     $('meta[name="twitter:title"]').attr('content') ||
                     $('h1').first().text() ||
                     $('title').text() ||
                     url;

    const removeSelectors = [
      'script', 'style', 'nav', 'footer', 'header', 'aside',
      '.ad', '.advertisement', '.ads', '.banner', '.popup', '.modal',
      '.share', '.sns', '.btn', '.button', '[role="navigation"]',
      '[class*="copyright"]', '[class*="reporter"]', '[class*="article-info"]',
      '[id*="copyright"]', '[id*="reporter"]', '[id*="article-info"]',
      '.byline', '.meta', '.metadata', '.published', '.date', '.timestamp',
      '.related', '.related-article', '.recommend', '.recommend-article',
      '.pagination', '.page-nav', '.social', '.twitter', '.facebook',
      '.print', '.print-btn', '.subscription', '.subscribe', '.newsletter',
      '[data-component="article-footer"]',
      '.article-footer', '.article-header', '.article-tool',
      '.floating-menu', '.sticky', '.fixed', '.overlay',
      'iframe', 'noscript', '.video-container', '.embed',
      '.author-info', '.journalist', '.writer-info',
      '.copyright-area', '.copy-area', '.copy-right',
      '.article-share', '.share-button', '.share-area',
      '.more-news', '.more-articles', '.see-also',
      '.ad-area', '.ad-space', '.ad-wrapper', '.ad-container',
      '[class*="ad-"]', '[id*="ad-"]', '[data-ad]',
      '.sponsor', '.partnership', '.promotion',
      '.newsletter-signup', '.subscribe-box',
      '.breadcrumb', '.breadcrumbs', '.path',
      '.search-box', '.search-bar', '.search-form'
    ];

    removeSelectors.forEach(selector => { $(selector).remove(); });

    const rawContent = $('body').text().trim();

    // content가 부족해도 LLM으로 분석 시도
    if (rawContent.length > 50) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const apiResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            model: 'qwen/qwen3-next-80b-a3b-instruct',
            messages: [
              {
                role: 'system',
                content: `당신은 웹 콘텐츠에서 핵심 정보만 추출하는 전문가입니다.

1. 제목: 기사의 핵심 주제만 50자 이내로 추출 (언론사명, 웹사이트명, "뉴스", "기사" 등 제외)

2. 본문: 다음 항목을 완전히 제외하고 핵심 내용만 800자 이내로 요약
   - 기자 이름/기자 소개 (예: "홍혜원 기자", "김철수 기자", "기자 정보", "제보", "무단전재")
   - 저작권/재배포 문구 (예: "copyright", "무단전재", "재배포 금지", "저작권자")
   - 구독/Newsletter 관련 문구
   - SNS 공유, 프린트, 기사 저장 버튼 텍스트
   - 더보기 링크, 관련 기사, 추천 기사
   - 광고, 배너, 제휴, 스폰서 관련 텍스트
   - 입력일시, 수정일시, 등록일시
   - 페이지 번호, 페이지 네비게이션
   - 빈 줄, 공백만 있는 줄
   - "CU 모델이", "BGF리테일 제공" 같은 캡션 텍스트
   - "파이낸셜뉴스" 같은 언론사명
   - "21일 업계에 따르면" 같은 도입부

3. 키워드: 기사와 관련된 핵심 개념/주제 5개를 한국어로 추출 (콤마로 구분)

출력 형식:
제목: [제목]
본문: [본문]
키워드: [키워드1, 키워드2, 키워드3, 키워드4, 키워드5]`
              },
              {
                role: 'user',
                content: `${rawTitle}\n\nURL: ${url}\n\n본문: ${rawContent || '(내용 없음 - 제목과 URL만으로 분석)'}`
              }
            ],
            temperature: 0.4,
            top_p: 0.9,
            max_tokens: 4096,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!apiResponse.ok) {
          throw new Error(`API error: ${apiResponse.status}`);
        }

        const apiBuffer = await apiResponse.arrayBuffer();
        const apiText = Buffer.from(apiBuffer).toString('utf-8');
        const data = JSON.parse(apiText);
        const result = data.choices[0]?.message?.content || '';

        const titleMatch = result.match(/제목:\s*([^\n]+)/);
        const contentMatch = result.match(/본문:\s*([\s\S]+?)(?=키워드:|$)/);
        const keywordMatch = result.match(/키워드:\s*([^\n]+)/);

        const title = titleMatch ? titleMatch[1].trim() : rawTitle.trim();
        let content = contentMatch ? contentMatch[1].trim().replace(/\s{2,}/g, ' ') : rawContent;

        let keywords: string[] = [];
        if (keywordMatch) {
          keywords = keywordMatch[1].split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
        }
        if (keywords.length === 0) keywords = extractKeywordsFromContent(content);

        content = content
          .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
          .replace(/\s+[가-힣]{2,4}\s+기자/g, '')
          .replace(/이 시각 핫클릭 이슈[\s\S]*/g, '')
          .replace(/localplace@fnnews\.com/g, '')
          .trim();

        return { title, content, keywords };
      } catch (llmError) {
        console.error('LLM processing error:', llmError);
        return {
          title: rawTitle.trim(),
          content: rawContent || `URL: ${url}\n\n콘텐츠 추출 실패 - 직접 방문하여 확인하세요.`,
          keywords: extractKeywordsFromContent(rawTitle)
        };
      }
    }

    return {
      title: rawTitle.trim(),
      content: `URL: ${url}\n\n본문이 너무 짧아 자동 요약할 수 없습니다. 직접 방문하여 확인하세요.`,
      keywords: extractKeywordsFromContent(rawTitle)
    };
  } catch (error) {
    console.error('Failed to fetch web content:', error);
    return {
      title: url,
      content: `URL: ${url}\n\n콘텐츠 추출 실패 - 직접 방문하여 확인하세요.`,
      keywords: []
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('id');

    if (docId) {
      const docs = await loadKnowledgeDocs();
      const doc = docs.find(d => d.id === docId);
      if (doc) return NextResponse.json({ documents: [doc] });
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const docs = await loadKnowledgeDocs();
    return NextResponse.json({ documents: docs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load knowledge documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { title, type, tags, url, content, summary }: KnowledgeDoc = body;

    if (url && (!content || content === url)) {
      const webData = await fetchWebContent(url);
      if (!title || title.includes('문서') || title === url) title = webData.title;
      content = webData.content;
      if (webData.keywords && webData.keywords.length > 0) tags = webData.keywords;
      summary = content.substring(0, 100) + '...';
    }

    if (!title || !type) {
      return NextResponse.json({ error: 'Missing required fields: title, type' }, { status: 400 });
    }

    const doc: KnowledgeDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      type: type as 'pdf' | 'web' | 'image',
      tags: tags || [],
      createdAt: new Date().toISOString().split('T')[0],
      summary,
      content,
      url,
    };

    const filePath = await saveKnowledgeDoc(doc);
    return NextResponse.json({ success: true, document: doc, filePath });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('id');
    if (!docId) return NextResponse.json({ error: 'Missing doc id parameter' }, { status: 400 });
    await deleteKnowledgeDoc(docId);
    return NextResponse.json({ success: true, deletedId: docId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    );
  }
}