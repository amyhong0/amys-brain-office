import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, knowledgeDocs } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 문서 내용을 컨텍스트로 구성
    const knowledgeContext = (knowledgeDocs || []).slice(0, 10).map((doc: any, i: number) =>
      `[문서 ${i + 1}]\n제목: ${doc.title}\n내용: ${doc.content || doc.summary || '(내용 없음)'}\n태그: ${(doc.tags || []).join(', ')}`
    ).join('\n\n');

    const llmResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-mini-4b-instruct',
        messages: [
          {
            role: 'system',
            content: `당신은 지식 베이스 기반 질의응답 AI입니다. 다음 지식 문서들만 참고하여 사용자 질문에 답변해주세요.

참고할 지식 문서들:
${knowledgeContext || '(저장된 지식이 없습니다.)'}

규칙:
- 위 문서 내용에 없는 정보는 "저장된 지식에 없는 내용입니다"라고 답변
- 문서 내용을 참고할 때는 관련 문서 제목을 함께 표시
- 답변은 간결하고 정확하게`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!llmResponse.ok) {
      throw new Error(`LLM API error: ${llmResponse.status}`);
    }

    const data = await llmResponse.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get response' },
      { status: 500 }
    );
  }
}