import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import * as cheerio from 'cheerio';
import { parseWithLLM, parseWithFallback } from '@/lib/utils/llm-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let content = '';
    let title = '';
    let tags: string[] = [];
    let keywords: string[] = [];

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

      // LLM 파싱 시도
      const llmResult = await parseWithLLM(html, data.url);
      
      if (llmResult) {
        title = llmResult.title;
        content = llmResult.content;
        tags = llmResult.tags;
        keywords = llmResult.keywords;
      } else {
        // Fallback 파싱
        const fallbackResult = parseWithFallback(html, data.url);
        title = fallbackResult.title;
        content = fallbackResult.content;
        tags = fallbackResult.tags;
        keywords = fallbackResult.keywords;
      }
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
      content,
      tags,
      keywords
    });
  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process document' },
      { status: 500 }
    );
  }
}
