import { OrchestratorAgent } from '../../lib/agents/orchestrator';
import { BaseAgent } from '../../lib/agents/base-agent';
import { Task, AgentResponse } from '../../lib/agents/types';

// Dummy agent for testing
class DummyAgent extends BaseAgent {
  constructor(id: string) {
    super(id, `Dummy ${id}`, 'tester', '🤖', 1);
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    this.setState({ status: 'working' });
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 10));
    this.setState({ status: 'idle' });
    return {
      success: true,
      data: `Task ${task.id} completed by ${this.state.id}`,
      agentId: this.state.id
    };
  }
}

describe('Orchestrator Agent', () => {
  let orchestrator: OrchestratorAgent;

  beforeEach(() => {
    orchestrator = new OrchestratorAgent();
  });

  describe('Agent Management', () => {
    it('should register and return agent states', () => {
      const dummy = new DummyAgent('document-processor');
      orchestrator.registerAgent(dummy);

      const states = orchestrator.getAgentStates();
      expect(states).toHaveLength(2); // Orchestrator + 1 Dummy
      expect(states.find(s => s.id === 'document-processor')).toBeDefined();
    });

    it('should unregister agent', () => {
      const dummy = new DummyAgent('document-processor');
      orchestrator.registerAgent(dummy);
      orchestrator.unregisterAgent('document-processor');

      const states = orchestrator.getAgentStates();
      expect(states).toHaveLength(1); // Only Orchestrator
    });
  });

  describe('Task Execution & Distribution', () => {
    it('should fail if no agent is available for task type', async () => {
      const task: Task = {
        id: 't1',
        type: 'document_process',
        description: 'Test process',
        priority: 'high',
        status: 'pending',
        createdAt: new Date()
      };

      const result = await orchestrator.executeTask(task);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No available agent');
    });

    it('should assign task to the correct agent and execute', async () => {
      const docProcessor = new DummyAgent('document-processor');
      orchestrator.registerAgent(docProcessor);

      const task: Task = {
        id: 't2',
        type: 'document_process',
        description: 'Test process',
        priority: 'high',
        status: 'pending',
        createdAt: new Date()
      };

      const result = await orchestrator.executeTask(task);
      expect(result.success).toBe(true);
      expect(result.agentId).toBe('document-processor');
      expect(task.assignedTo).toBe('document-processor');
    });
  });

  describe('Task Queue Management', () => {
    it('should add tasks to queue', () => {
      const task: Task = {
        id: 't3',
        type: 'knowledge_analyze',
        description: 'Analyze',
        priority: 'medium',
        status: 'pending',
        createdAt: new Date()
      };
      
      orchestrator.addToTaskQueue(task);
      expect(orchestrator.getTaskQueue()).toHaveLength(1);
    });
  });
});
