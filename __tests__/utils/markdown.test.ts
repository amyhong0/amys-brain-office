import { 
  parseMarkdownFile, 
  createMarkdownFile, 
  buildKnowledgeGraph,
  MarkdownMetadata
} from '../../lib/utils/markdown';
import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';

jest.mock('fs/promises');

describe('Markdown Utils', () => {
  const mockMetadata: MarkdownMetadata = {
    id: 'test-doc-1',
    type: 'pdf',
    title: 'Test Document',
    tags: ['test', 'jest'],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    relatedDocs: ['test-doc-2']
  };

  const mockContent = '# Hello World\nThis is a test content.';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseMarkdownFile', () => {
    it('should parse metadata and content correctly', async () => {
      const validFrontmatter = matter.stringify(mockContent, mockMetadata);
      (fs.readFile as jest.Mock).mockResolvedValue(validFrontmatter);

      const result = await parseMarkdownFile('dummy/path.md');

      expect(fs.readFile).toHaveBeenCalledWith('dummy/path.md', 'utf-8');
      expect(result.metadata.id).toBe('test-doc-1');
      expect(result.metadata.title).toBe('Test Document');
      expect(result.content.trim()).toBe(mockContent.trim());
      expect(result.mdPath).toBe('dummy/path.md');
    });
  });

  describe('createMarkdownFile', () => {
    it('should write formatted markdown to file system', async () => {
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const resultPath = await createMarkdownFile(mockMetadata, mockContent, 'out/dir');

      expect(fs.writeFile).toHaveBeenCalled();
      expect(resultPath).toBe(path.join('out/dir', 'test-doc-1.md'));
      
      const writeCall = (fs.writeFile as jest.Mock).mock.calls[0];
      expect(writeCall[0]).toBe(resultPath);
      expect(writeCall[1]).toContain('title: Test Document');
      expect(writeCall[1]).toContain('# Hello World');
    });
  });

  describe('buildKnowledgeGraph', () => {
    it('should convert parsed documents to nodes and edges', () => {
      const docs = [
        {
          metadata: mockMetadata,
          content: mockContent,
          mdPath: 'path1.md'
        },
        {
          metadata: { ...mockMetadata, id: 'test-doc-2', relatedDocs: [] },
          content: 'Content 2',
          mdPath: 'path2.md'
        }
      ];

      const graph = buildKnowledgeGraph(docs);

      expect(graph.nodes).toHaveLength(2);
      expect(graph.edges).toHaveLength(1);
      
      const edge = graph.edges[0];
      expect(edge.source).toBe('test-doc-1');
      expect(edge.target).toBe('test-doc-2');
    });
  });
});
