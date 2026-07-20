import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let content = '';
    let title = '';

    if (type === 'pdf') {
      // PDF 처리
      if (!data.buffer) {
        return NextResponse.json(
          { error: 'PDF buffer is required' },
          { status: 400 }
        );
      }

      const pdfData = await pdf(data.buffer);
      content = pdfData.text;
      title = data.filename || 'Untitled PDF';
    } else if (type === 'web') {
      // 웹페이지 스크래핑
      if (!data.url) {
        return NextResponse.json(
          { error: 'URL is required for web scraping' },
          { status: 400 }
        );
      }

      const response = await fetch(data.url);
      const html = await response.text();
      const $ = cheerio.load(html);

      // 본문 추출 (간단한 방식)
      content = $('p').map((_, el) => $(el).text()).get().join('\n\n');
      title = $('title').text() || data.url;
    } else {
      return NextResponse.json(
        { error: 'Unsupported document type' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      type,
      title,
      content
    });
  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process document' },
      { status: 500 }
    );
  }
}
