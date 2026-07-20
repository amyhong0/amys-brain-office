import { OrchestratorAgent } from '../../lib/agents/orchestrator';
import { DocumentProcessorAgent } from '../../lib/agents/document-processor';
import { KnowledgeAnalyzerAgent } from '../../lib/agents/knowledge-analyzer';
import { Task } from '../../lib/agents/types';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('Integration: Agent Pipeline', () => {
  it('should process document and analyze knowledge in pipeline', async () => {
    const orchestrator = new OrchestratorAgent();
    orchestrator.registerAgent(new DocumentProcessorAgent());
    orchestrator.registerAgent(new KnowledgeAnalyzerAgent());

    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.readdir as jest.Mock).mockResolvedValue(['doc1.md']);
    (fs.readFile as jest.Mock).mockResolvedValue('---\nid: doc1\n---\ncontent');

    const task1: Task = { id: 't1', type: 'document_process', description: JSON.stringify({ type: 'web', title: 'A', content: 'B' }), priority: 'high', status: 'pending', createdAt: new Date() };
    const res1 = await orchestrator.executeTask(task1);
    expect(res1.success).toBe(true);

    const task2: Task = { id: 't2', type: 'knowledge_analyze', description: JSON.stringify({ query: 'B' }), priority: 'high', status: 'pending', createdAt: new Date() };
    const res2 = await orchestrator.executeTask(task2);
    expect(res2.success).toBe(true);
  });
});
