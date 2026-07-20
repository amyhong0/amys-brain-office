import { AgentState, AgentResponse, Task } from './types';

export abstract class BaseAgent {
  protected state: AgentState;
  protected taskQueue: Task[] = [];

  constructor(
    id: string,
    name: string,
    role: string,
    emoji: string,
    floor: number
  ) {
    this.state = {
      id,
      name,
      role,
      emoji,
      status: 'idle',
      position: { x: 0, y: 0 },
      floor
    };
  }

  getState(): AgentState {
    return { ...this.state };
  }

  setState(updates: Partial<AgentState>): void {
    this.state = { ...this.state, ...updates };
  }

  abstract executeTask(task: Task): Promise<AgentResponse>;

  protected updateProgress(taskId: string, progress: number): void {
    const task = this.taskQueue.find(t => t.id === taskId);
    if (task) {
      task.progress = progress;
    }
  }

  protected completeTask(taskId: string): void {
    const taskIndex = this.taskQueue.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      this.taskQueue[taskIndex].status = 'completed';
      this.taskQueue[taskIndex].progress = 100;
    }
  }

  protected failTask(taskId: string, error: string): void {
    const taskIndex = this.taskQueue.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      this.taskQueue[taskIndex].status = 'failed';
    }
  }
}
