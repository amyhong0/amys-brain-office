import { DebuggerAgent } from '../../lib/agents/debugger';
import { Task } from '../../lib/agents/types';

describe('Debugger Agent', () => {
  let agent: DebuggerAgent;

  beforeEach(() => {
    agent = new DebuggerAgent();
  });

  it('should initialize correctly', () => {
    const state = agent.getState();
    expect(state.id).toBe('debugger');
    expect(state.role).toBe('수의사');
  });

  it('should analyze and fix syntax errors', async () => {
    const taskDesc = JSON.stringify({
      code: 'const a = 1\nconsole.log(a)',
      error: 'syntax error on line 1',
      codeType: 'mcp-server'
    });

    const task: Task = {
      id: 'task-debug-1',
      type: 'debug',
      description: taskDesc,
      priority: 'high',
      status: 'assigned',
      createdAt: new Date()
    };

    (agent as any).taskQueue.push(task);

    const response = await agent.executeTask(task);

    expect(response.success).toBe(true);
    expect(response.data.errorAnalysis.type).toBe('syntax');
    expect(response.data.fixedCode).toContain('const a = 1;'); // check if syntax fix applied
    
    expect(task.progress).toBe(100);
    expect(task.status).toBe('completed');
  });
});
