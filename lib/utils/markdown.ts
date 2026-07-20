import matter from 'gray-matter';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface MarkdownMetadata {
  id: string;
  type: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  relatedDocs: string[];
}

export interface ParsedDocument {
  metadata: MarkdownMetadata;
  content: string;
  mdPath: string;
}

export async function parseMarkdownFile(filePath: string): Promise<ParsedDocument> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: markdown } = matter(content);
  
  return {
    metadata: data as MarkdownMetadata,
    content: markdown,
    mdPath: filePath
  };
}

export async function createMarkdownFile(
  metadata: MarkdownMetadata,
  content: string,
  directory: string
): Promise<string> {
  const mdContent = matter.stringify(content, metadata);
  const fileName = `${metadata.id}.md`;
  const filePath = path.join(directory, fileName);
  
  await fs.writeFile(filePath, mdContent, 'utf-8');
  
  return filePath;
}

export async function updateMarkdownMetadata(
  filePath: string,
  updates: Partial<MarkdownMetadata>
): Promise<void> {
  const parsed = await parseMarkdownFile(filePath);
  const updatedMetadata = { ...parsed.metadata, ...updates, updatedAt: new Date().toISOString() };
  
  await createMarkdownFile(updatedMetadata, parsed.content, path.dirname(filePath));
}

export async function getAllDocuments(directory: string): Promise<ParsedDocument[]> {
  const files = await fs.readdir(directory);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  
  const documents = await Promise.all(
    mdFiles.map(file => parseMarkdownFile(path.join(directory, file)))
  );
  
  return documents;
}

export function buildKnowledgeGraph(documents: ParsedDocument[]): any {
  const nodes = documents.map(doc => ({
    id: doc.metadata.id,
    documentId: doc.metadata.id,
    type: doc.metadata.type,
    position: { 
      x: Math.random() * 800, 
      y: Math.random() * 600 
    },
    mdPath: doc.mdPath,
    metadata: doc.metadata
  }));

  const edges: any[] = [];
  
  documents.forEach(doc => {
    doc.metadata.relatedDocs.forEach(relatedId => {
      const edgeId = `${doc.metadata.id}-${relatedId}`;
      if (!edges.find(e => e.id === edgeId)) {
        edges.push({
          id: edgeId,
          source: doc.metadata.id,
          target: relatedId,
          strength: 1
        });
      }
    });
  });

  return { nodes, edges };
}
