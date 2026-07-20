import { DeveloperAgent } from '../../lib/agents/developer';
import { Task } from '../../lib/agents/types';

describe('Developer Agent', () => {
  let agent: DeveloperAgent;

  beforeEach(() => {
    agent = new DeveloperAgent();
  });

  it('should initialize correctly', () => {
    const state = agent.getState();
    expect(state.id).toBe('developer');
    expect(state.role).toBe('대장장이');
  });

  it('should generate and test mcp-server code successfully', async () => {
    const taskDesc = JSON.stringify({
      codeType: 'mcp-server',
      requirements: {
        name: 'test-server',
        tools: [{ name: 'test-tool', description: 'desc' }]
      }
    });

    const task: Task = {
      id: 'task-dev-1',
      type: 'develop',
      description: taskDesc,
      priority: 'high',
      status: 'assigned',
      createdAt: new Date()
    };

    (agent as any).taskQueue.push(task);

    const response = await agent.executeTask(task);

    expect(response.success).toBe(true);
    expect(response.data.code).toContain('test-server');
    expect(response.data.code).toContain('test-tool');
    expect(response.data.testResult.success).toBe(true);
    
    expect(task.progress).toBe(100);
    expect(task.status).toBe('completed');
  });
});
