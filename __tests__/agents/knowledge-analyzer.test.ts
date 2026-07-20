import { KnowledgeAnalyzerAgent } from '../../lib/agents/knowledge-analyzer';
import { Task } from '../../lib/agents/types';
import * as fs from 'fs/promises';
import matter from 'gray-matter';

jest.mock('fs/promises');

describe('Knowledge Analyzer Agent', () => {
  let agent: KnowledgeAnalyzerAgent;

  beforeEach(() => {
    agent = new KnowledgeAnalyzerAgent();
    jest.clearAllMocks();
  });

  it('should initialize correctly', () => {
    const state = agent.getState();
    expect(state.id).toBe('knowledge-analyzer');
    expect(state.role).toBe('연구원');
  });

  it('should search documents and analyze relationships', async () => {
    (fs.readdir as jest.Mock).mockResolvedValue(['doc1.md', 'doc2.md']);
    
    // doc1 matches keyword "tech" and query "content"
    const doc1Content = matter.stringify('Content about AI and stuff.', {
      id: 'doc-1',
      title: 'Doc 1',
      type: 'pdf',
      tags: ['ai', 'tech'],
      createdAt: '2024-01-20T10:00:00Z',
      relatedDocs: []
    });

    // doc2 matches keyword "tech" and query "content"
    const doc2Content = matter.stringify('Another content.', {
      id: 'doc-2',
      title: 'Doc 2',
      type: 'web',
      tags: ['tech'],
      createdAt: '2024-01-21T10:00:00Z',
      relatedDocs: []
    });

    (fs.readFile as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath.includes('doc1.md')) return Promise.resolve(doc1Content);
      if (filePath.includes('doc2.md')) return Promise.resolve(doc2Content);
      return Promise.resolve('');
    });

    const taskDesc = JSON.stringify({
      query: 'content',
      keywords: ['tech']
    });

    const task: Task = {
      id: 'task-knowledge-1',
      type: 'knowledge_analyze',
      description: taskDesc,
      priority: 'medium',
      status: 'assigned',
      createdAt: new Date()
    };

    (agent as any).taskQueue.push(task);

    const response = await agent.executeTask(task);

    expect(response.success).toBe(true);
    expect(response.data.documents).toHaveLength(2);
    expect(response.data.relatedDocs).toHaveLength(1);
    
    const relationship = response.data.relatedDocs[0];
    expect(relationship.source).toBe('doc-1');
    expect(relationship.target).toBe('doc-2');
    expect(relationship.strength).toBe(1); // 1 common tag ('tech')
    
    expect(task.progress).toBe(100);
    expect(task.status).toBe('completed');
  });

  it('should handle errors gracefully', async () => {
    const task: Task = {
      id: 'task-err',
      type: 'knowledge_analyze',
      description: 'invalid json',
      priority: 'high',
      status: 'assigned',
      createdAt: new Date()
    };

    (agent as any).taskQueue.push(task);
    const response = await agent.executeTask(task);

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(agent.getState().status).toBe('idle');
  });
});
