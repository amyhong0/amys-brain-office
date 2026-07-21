import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import pdf from 'pdf-parse';
import * as cheerio from 'cheerio';
import { createMarkdownFile, MarkdownMetadata } from '@/lib/utils/markdown';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content, title, url, tags, keywords } = body;

    if (!type || !content || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: type, content, title' },
        { status: 400 }
      );
    }

    // 문서 ID 생성
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // 메타데이터 생성
    const metadata: MarkdownMetadata = {
      id: documentId,
      type,
      title,
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
      relatedDocs: []
    };

    // 키워드를 본문에 추가
    let finalContent = content;
    if (keywords && keywords.length > 0) {
      finalContent = `${content}\n\n## 핵심 키워드\n\n${keywords.map((k: string) => `- ${k}`).join('\n')}`;
    }

    // MD 파일 생성
    const documentsDir = path.join(process.cwd(), 'knowledge', 'documents');
    const mdPath = await createMarkdownFile(metadata, finalContent, documentsDir);

    return NextResponse.json({
      success: true,
      documentId,
      mdPath,
      metadata
    });
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create document' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const documentsDir = path.join(process.cwd(), 'knowledge', 'documents');
    const files = await fs.readdir(documentsDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const documents = [];

    for (const file of mdFiles) {
      const filePath = path.join(documentsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // 간단한 파싱 (frontmatter 추출)
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const metadata = JSON.parse(
          frontmatterMatch[1]
            .replace(/(\w+):/g, '"$1":')
            .replace(/'/g, '"')
        );

        if (!type || metadata.type === type) {
          documents.push(metadata);
        }
      }
    }

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Document listing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list documents' },
      { status: 500 }
    );
  }
}
