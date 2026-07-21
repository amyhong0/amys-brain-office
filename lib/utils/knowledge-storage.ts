import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import matter from 'gray-matter';

// 기본 저장 경로: Vercel 서버리스 환경에서는 /tmp 사용, 로컬에서는 Documents
const getKbDir = (): string => {
  if (process.env.KB_STORAGE_PATH) return process.env.KB_STORAGE_PATH;
  if (process.env.VERCEL) return '/tmp/amys-brain-office-kb';
  const homeDir = os.homedir();
  const documentsDir = path.join(homeDir, 'Documents');
  return path.join(documentsDir, 'amys-brain-office-kb');
};

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

// 디렉토리 존재 확인 및 생성
export async function ensureKbDirectory(): Promise<string> {
  const dir = getKbDir();
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  return dir;
}

// 모든 문서 로드
export async function loadKnowledgeDocs(): Promise<KnowledgeDoc[]> {
  const dir = await ensureKbDirectory();
  try {
    const files = await fs.readdir(dir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const docs: KnowledgeDoc[] = [];
    for (const file of mdFiles) {
      const filePath = path.join(dir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const { data } = matter(content);
      
      docs.push({
        id: data.id || file.replace('.md', ''),
        title: data.title || 'Untitled',
        type: data.type || 'web',
        tags: data.tags || [],
        createdAt: data.createdAt || new Date().toISOString(),
        summary: data.summary,
        content: content.replace(/^---[\s\S]*?---/, '').trim(),
        url: data.url,
      });
    }
    
    // 날짜 역순 정렬
    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Failed to load knowledge docs:', error);
    return [];
  }
}

// 단일 문서 저장
export async function saveKnowledgeDoc(doc: KnowledgeDoc): Promise<string> {
  const dir = await ensureKbDirectory();
  
  // undefined 값 제외한 메타데이터 생성
  const metadata: Record<string, unknown> = {
    id: doc.id,
    title: doc.title,
    type: doc.type,
    tags: doc.tags,
    createdAt: doc.createdAt,
  };
  
  // 선택적 필드들 - 값이 있을 때만 추가
  if (doc.summary) metadata.summary = doc.summary;
  if (doc.url) metadata.url = doc.url;
  
  const mdContent = matter.stringify(doc.content || doc.summary || '', metadata);
  const fileName = `${doc.id}.md`;
  const filePath = path.join(dir, fileName);
  
  await fs.writeFile(filePath, mdContent, 'utf-8');
  return filePath;
}

// 단일 문서 삭제
export async function deleteKnowledgeDoc(docId: string): Promise<void> {
  const dir = await ensureKbDirectory();
  const filePath = path.join(dir, `${docId}.md`);
  
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete doc ${docId}:`, error);
  }
}