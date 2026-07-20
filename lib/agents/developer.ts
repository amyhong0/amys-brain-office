import { BaseAgent } from './base-agent';
import { AgentResponse, Task } from './types';

export class DeveloperAgent extends BaseAgent {
  constructor() {
    super('developer', '개발자 에이전트', '대장장이', '🔧', 4);
    this.state.position = { x: 70, y: 30 };
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    this.setState({ status: 'working', currentTask: task.description });
    this.updateProgress(task.id, 0);

    try {
      const { codeType, requirements } = JSON.parse(task.description);
      
      this.updateProgress(task.id, 30);
      
      // 코드 생성
      const code = await this.generateCode(codeType, requirements);
      
      this.updateProgress(task.id, 60);
      
      // 테스트 수행
      const testResult = await this.testCode(code, codeType);
      
      this.updateProgress(task.id, 90);
      
      if (testResult.success) {
        this.updateProgress(task.id, 100);
        this.completeTask(task.id);
        
        this.setState({ status: 'idle', currentTask: undefined });
        
        return {
          success: true,
          data: { code, testResult },
          agentId: this.state.id
        };
      } else {
        // 테스트 실패 시 디버거 에이전트에 요청
        this.setState({ status: 'idle', currentTask: undefined });
        
        return {
          success: false,
          error: `Test failed: ${testResult.error}`,
          agentId: this.state.id,
          data: { code, testResult, requiresDebugger: true }
        };
      }
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

  private async generateCode(codeType: string, requirements: any): Promise<string> {
    // MCP 서버 코드 생성 예시
    if (codeType === 'mcp-server') {
      return `
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: '${requirements.name || 'custom-mcp-server'}',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Add tool implementations based on requirements
${requirements.tools ? requirements.tools.map((tool: any) => `
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === '${tool.name}') {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ result: '${tool.description}' })
      }]
    };
  }
  throw new Error('Tool not found');
});
`).join('\n') : ''}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
`;
    }
    
    return '// Code generation not implemented for this type';
  }

  private async testCode(code: string, codeType: string): Promise<{ success: boolean; error?: string }> {
    // 기본 문법 검사
    try {
      // 간단한 유효성 검사
      if (!code || code.trim().length === 0) {
        return { success: false, error: 'Generated code is empty' };
      }
      
      // MCP 서버인 경우 필수 구성 확인
      if (codeType === 'mcp-server') {
        if (!code.includes('Server') || !code.includes('transport')) {
          return { success: false, error: 'Missing required MCP server components' };
        }
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown test error' 
      };
    }
  }
}
