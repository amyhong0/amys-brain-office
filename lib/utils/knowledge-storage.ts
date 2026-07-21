import { put, list, get, del } from '@vercel/blob';
import matter from 'gray-matter';

export interface KnowledgeDoc {
  id: string;
  title: string;
  type: 'pdf' | 'web' | 'image';
  tags: string[];
  createdAt: string;
  summary?: string;
  content?: string;
  url?: string;
}

// 파일명 생성
function getDocFileName(docId: string): string {
  return `${docId}.md`;
}

// 모든 문서 로드
export async function loadKnowledgeDocs(): Promise<KnowledgeDoc[]> {
  try {
    const { blobs } = await list({
      prefix: 'knowledge/',
      limit: 100,
    });

    const docs: KnowledgeDoc[] = [];
    for (const blob of blobs) {
      if (!blob.url.endsWith('.md')) continue;
      
      const response = await fetch(blob.url);
      const content = await response.text();
      const { data } = matter(content);
      
      docs.push({
        id: data.id || blob.pathname.replace('knowledge/', '').replace('.md', ''),
        title: data.title || 'Untitled',
        type: data.type || 'web',
        tags: data.tags || [],
        createdAt: data.createdAt || new Date().toISOString(),
        summary: data.summary,
        content: content.replace(/^---[\s\S]*?---/, '').trim(),
        url: data.url,
      });
    }

    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Failed to load knowledge docs:', error);
    return [];
  }
}

// 단일 문서 저장
export async function saveKnowledgeDoc(doc: KnowledgeDoc): Promise<string> {
  const metadata: Record<string, unknown> = {
    id: doc.id,
    title: doc.title,
    type: doc.type,
    tags: doc.tags,
    createdAt: doc.createdAt,
  };

  if (doc.summary) metadata.summary = doc.summary;
  if (doc.url) metadata.url = doc.url;

  const mdContent = matter.stringify(doc.content || doc.summary || '', metadata);
  const fileName = getDocFileName(doc.id);
  const pathname = `knowledge/${fileName}`;

  const blob = await put(pathname, mdContent, {
    access: 'public',
    contentType: 'text/markdown',
  });

  return blob.url;
}

// 단일 문서 삭제
export async function deleteKnowledgeDoc(docId: string): Promise<void> {
  const pathname = `knowledge/${getDocFileName(docId)}`;
  try {
    const { blobs } = await list({
      prefix: pathname,
      limit: 1,
    });

    if (blobs.length > 0) {
      await del(blobs[0].url);
    }
  } catch (error) {
    console.error(`Failed to delete doc ${docId}:`, error);
  }
}