import { BaseAgent } from './base-agent';
import { AgentResponse, Task, Document } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class DocumentProcessorAgent extends BaseAgent {
  constructor() {
    super('document-processor', '문서 처리 에이전트', '도서관 사서', '📚', 2);
    this.state.position = { x: 30, y: 30 };
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    this.setState({ status: 'working', currentTask: task.description });
    this.updateProgress(task.id, 0);

    try {
      const { type, content, title, url } = JSON.parse(task.description);
      
      this.updateProgress(task.id, 30);
      
      // MD 파일 생성
      const documentId = `doc-${Date.now()}`;
      const mdPath = path.join(process.cwd(), 'knowledge', 'documents', `${documentId}.md`);
      
      const mdContent = this.generateMarkdown(documentId, type, title, content, url);
      
      this.updateProgress(task.id, 60);
      
      await fs.writeFile(mdPath, mdContent, 'utf-8');
      
      this.updateProgress(task.id, 100);
      this.completeTask(task.id);
      
      this.setState({ status: 'idle', currentTask: undefined });
      
      return {
        success: true,
        data: { documentId, mdPath },
        agentId: this.state.id
      };
    } catch (error) {
      this.failTask(task.id, error instanceof Error ? error.message : 'Unknown error');
      this.setState({ status: 'idle', currentTask: undefined });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        agentId: this.state.id
      };
    }
  }

  private generateMarkdown(
    id: string,
    type: string,
    title: string,
    content: string,
    url?: string
  ): string {
    const now = new Date().toISOString();
    
    return `---
id: ${id}
type: ${type}
title: "${title}"
tags: []
createdAt: ${now}
updatedAt: ${now}
relatedDocs: []
---

# ${title}

${content}

${url ? `\n\n**Source:** ${url}` : ''}
`;
  }
}
