import { DocumentProcessorAgent } from '../../lib/agents/document-processor';
import { Task } from '../../lib/agents/types';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('Document Processor Agent', () => {
  let agent: DocumentProcessorAgent;

  beforeEach(() => {
    agent = new DocumentProcessorAgent();
    jest.clearAllMocks();
  });

  it('should initialize with correct state', () => {
    const state = agent.getState();
    expect(state.id).toBe('document-processor');
    expect(state.role).toBe('도서관 사서');
    expect(state.status).toBe('idle');
  });

  it('should process document task and generate markdown', async () => {
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const taskDesc = JSON.stringify({
      type: 'web',
      title: 'Test Web Page',
      content: 'This is test content',
      url: 'https://example.com'
    });

    const task: Task = {
      id: 'task-doc-1',
      type: 'document_process',
      description: taskDesc,
      priority: 'high',
      status: 'assigned',
      createdAt: new Date()
    };

    // Inject task into queue to test progress tracking
    (agent as any).taskQueue.push(task);

    const response = await agent.executeTask(task);

    expect(response.success).toBe(true);
    expect(response.data.documentId).toBeDefined();
    expect(response.data.mdPath).toContain('documents');

    expect(fs.writeFile).toHaveBeenCalled();
    const writeCall = (fs.writeFile as jest.Mock).mock.calls[0];
    const fileContent = writeCall[1];
    
    expect(fileContent).toContain('type: web');
    expect(fileContent).toContain('title: "Test Web Page"');
    expect(fileContent).toContain('# Test Web Page');
    expect(fileContent).toContain('This is test content');
    expect(fileContent).toContain('**Source:** https://example.com');
    
    // Check task progress update
    expect(task.status).toBe('completed');
    expect(task.progress).toBe(100);
  });

  it('should fail gracefully if JSON parsing fails', async () => {
    const task: Task = {
      id: 'task-doc-error',
      type: 'document_process',
      description: 'Invalid JSON',
      priority: 'high',
      status: 'assigned',
      createdAt: new Date()
    };

    (agent as any).taskQueue.push(task);

    const response = await agent.executeTask(task);

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(agent.getState().status).toBe('idle');
    expect(task.status).toBe('failed');
  });
});
