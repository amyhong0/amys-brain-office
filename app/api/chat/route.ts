import { NextRequest, NextResponse } from 'next/server';
import { loadKnowledgeDocs } from '@/lib/utils/knowledge-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 서버에서 직접 지식 문서 로드
    const allDocs = await loadKnowledgeDocs();
    const docs = allDocs.slice(0, 5);
    const knowledgeContext = docs.map((doc: any, i: number) => {
      let raw = (doc.content || doc.summary || '');
      // 1) HTML 태그 제거
      let clean = raw.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ');
      // 2) 기상/날씨 정보 제거 (숫자℃, 구름맑음 등)
      clean = clean.replace(/\d+\.?\d*℃/g, '').replace(/[가-힣]{2,4}\d+\.?\d*℃/g, '');
      // 3) 이메일/URL 제거
      clean = clean.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
      clean = clean.replace(/https?:\/\/[^\s]+/g, '');
      // 4) copyright/무단전재 등 제거
      clean = clean.replace(/copyright[^\n]*/gi, '').replace(/무단전재[^\n]*/gi, '');
      // 5) 연속 공백/탭 정리
      clean = clean.replace(/[\t\r]+/g, '\n').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n');
      // 6) 의미 있는 라인만 필터링 (10자 이상, 날짜/네비게이션 제외)
      const lines = clean.split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => {
          if (l.length < 10) return false;
          if (/^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}/.test(l)) return false; // 날짜
          if (/^(home|menu|search|login|회원|기자|copyright|저작권|제호|등록|발행|운영|고충|UPDATE|최상단|기사제보|문의|닫기|검색|페이스북|엑스|카카오|네이버|밴드|HOT뉴스|더보기|신문사|편집|윤리|찾아오|개인정보|청소년|이메일|URL복사|목록|메일|프린트|스크랩|글씨)/i.test(l)) return false;
          if (/기자\s*$/.test(l)) return false;
          return true;
        });
      // 7) 첫 10줄, 500자 제한
      const mainContent = lines.slice(0, 10).join('\n').substring(0, 500);
      return `[문서 ${i + 1}]\n제목: ${doc.title}\n내용: ${mainContent || '(내용 없음)'}\n태그: ${(doc.tags || []).join(', ')}`;
    }).join('\n\n');

    const systemPrompt = docs.length > 0
      ? `당신은 지식 베이스 기반 질의응답 AI입니다. 다음은 사용자가 저장한 지식 문서들입니다.

참고할 지식 문서들:
${knowledgeContext}

중요 규칙:
1. 반드시 한국어로만 답변하세요.
2. 위 문서들의 내용을 읽고, 사용자 질문과 관련된 내용이 있으면 그 내용을 바탕으로 상세히 답변하세요.
3. 문서 내용을 인용할 때는 반드시 [참조: 문서제목] 형식을 답변 중간에 포함하세요.
4. 관련 내용이 여러 문서에 있으면 모두 종합하여 답변하세요.
5. 문서 내용에 없는 정보는 "저장된 지식에 없는 내용입니다"라고 답변하고 추가 정보를 요청하세요.
6. 답변은 문서 내용을 요약/설명하는 형태로 자연스럽게 작성하세요.
7. 문서 제목만 알려주지 말고, 실제 문서 내용을 바탕으로 답변하세요.`
      : `당신은 유용한 AI 어시스턴트입니다. 반드시 한국어로만 간결하고 친절하게 답변해주세요.`;

    const requestBody = JSON.stringify({
      model: 'nvidia/nemotron-mini-4b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.4,
      max_tokens: 1024,
    });

    console.log('Request body:', requestBody);

    const llmResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      console.error('LLM API Error Details:', {
        status: llmResponse.status,
        statusText: llmResponse.statusText,
        headers: Object.fromEntries(llmResponse.headers.entries()),
        body: errText,
        requestHeaders: {
          'Authorization': process.env.NVIDIA_API_KEY ? 'Bearer ***' : 'MISSING',
          'Content-Type': 'application/json',
        },
      });
      throw new Error(`LLM API error ${llmResponse.status}: ${errText}`);
    }

    const apiBuffer = await llmResponse.arrayBuffer();
    const apiText = Buffer.from(apiBuffer).toString('utf-8');
    const data = JSON.parse(apiText);
    const aiResponse = data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';

    return NextResponse.json({ 
      response: aiResponse,
      documents: docs.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content || doc.summary || '',
        tags: doc.tags || [],
        createdAt: doc.createdAt,
        url: doc.url,
      }))
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
