// NVIDIA API 모델 목록 확인 및 테스트
const apiKey = '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';

async function testModels() {
  const models = [
    'z-ai/glm-5.2',
    'z-ai/glm-5',
    'zai/glm-5.2',
    'qwen/qwen3-next-80b-a3b-instruct',
    'google/gemma-4-31b-it',
  ];

  for (const model of models) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: '안녕하세요' }],
          max_tokens: 50,
        }),
      });

      const text = await res.text();
      console.log(`\n${model}: ${res.status}`);
      if (res.ok) {
        const data = JSON.parse(text);
        console.log('응답:', data.choices?.[0]?.message?.content?.substring(0, 100));
      } else {
        console.log('에러:', text.substring(0, 200));
      }
    } catch (err) {
      console.log(`${model}: ${err.message}`);
    }
  }
}

testModels();