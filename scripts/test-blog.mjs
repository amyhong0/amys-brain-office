// 네이버 블로그 파싱 테스트
const url = 'https://blog.naver.com/wjk0219/224353358174';

async function test() {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    console.log('status', res.status, 'time', Date.now() - start, 'ms');
    const html = await res.text();
    console.log('html length', html.length);

    // 간단한 텍스트 추출
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    console.log('text length', text.length);
    console.log('text preview', text.substring(0, 500));
  } catch (e) {
    console.error('err', e.message);
  }
}

test();