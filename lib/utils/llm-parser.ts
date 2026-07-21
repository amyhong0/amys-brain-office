import OpenAI from 'openai';

interface ParsedContent {
  title: string;
  content: string;
  tags: string[];
  keywords: string[];
}

export async function parseWithLLM(html: string, url: string): Promise<ParsedContent | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('OpenAI API key not found, using fallback parser');
    return null;
  }

  try {
    const openai = new OpenAI({ apiKey });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 웹페이지 내용을 분석하는 전문가입니다. 
HTML에서 본문 내용을 추출하고, 핵심 키워드와 태그를 추출하세요.
다음 JSON 형식으로 응답하세요:
{
  "title": "페이지 제목",
  "content": "본문 내용 (마크다운 형식)",
  "tags": ["태그1", "태그2"],
  "keywords": ["키워드1", "키워드2"]
}`
        },
        {
          role: 'user',
          content: `다음 HTML에서 본문 내용을 추출하고 핵심 키워드를 찾으세요:\n\n${html.substring(0, 15000)}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      title: result.title || url,
      content: result.content || '',
      tags: result.tags || [],
      keywords: result.keywords || []
    };
  } catch (error) {
    console.error('LLM parsing error:', error);
    return null;
  }
}

export function parseWithFallback(html: string, url: string): ParsedContent {
  const $ = require('cheerio').load(html);
  
  // 제목 추출
  const title = $('title').text() || $('h1').first().text() || url;
  
  // 본문 추출 - 더 정교한 방식
  const content = extractMainContent($);
  
  // 키워드 추출 (간단한 방식)
  const keywords = extractKeywords(content);
  
  // 태그 생성 (키워드 기반)
  const tags = keywords.slice(0, 5);
  
  return {
    title,
    content,
    tags,
    keywords
  };
}

function extractMainContent($: any): string {
  // 광고 및 불필요한 요소 제거
  const removeSelectors = [
    'script',
    'style',
    'nav',
    'footer',
    'header',
    '.ad',
    '.advertisement',
    '.ads',
    '.banner',
    '.popup',
    '.modal',
    'iframe',
    'noscript',
    '[class*="ad-"]',
    '[id*="ad-"]',
    '.social-share',
    '.related-links',
    '.comments',
    '.sidebar'
  ];
  
  removeSelectors.forEach(selector => {
    $(selector).remove();
  });
  
  // 메인 콘텐츠 영역 찾기
  const mainSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.content',
    '.post-content',
    '.article-content',
    '.entry-content',
    '#content',
    '#main',
    '.article-body',
    '.news-content'
  ];
  
  let content = '';
  
  for (const selector of mainSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text();
      if (content.length > 200) break;
    }
  }
  
  // 메인 영역을 찾지 못한 경우, 모든 p 태그 사용
  if (content.length < 200) {
    content = $('p').map((_: any, el: any) => {
      const text = $(el).text();
      // 너무 짧은 문단 제거 (광고 등)
      return text.length > 20 ? text : '';
    }).get().filter((t: string) => t).join('\n\n');
  }
  
  // 불필요한 텍스트 정리
  content = content
    .replace(/\s+/g, ' ')  // 여러 공백을 하나로
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // 여러 줄바꿈을 두 줄로
    .replace(/^\s+|\s+$/gm, '')  // 각 줄 앞뒤 공백 제거
    .trim();
  
  return content;
}

function extractKeywords(text: string): string[] {
  // 한국어와 영어 단어 추출
  const words = text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);
  
  // 불용어 제거
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'of', 'for', 'with', 'as',
    '이', '그', '저', '것', '의', '를', '을', '에', '에서', '와', '과', '하다', '되다', '이다'
  ]);
  
  const filteredWords = words.filter(word => !stopWords.has(word));
  
  // 빈도수 계산
  const wordCount = new Map<string, number>();
  filteredWords.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // 상위 10개 키워드 추출
  const sorted = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
  
  return sorted;
}
