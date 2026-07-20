declare module '@modelcontextprotocol/sdk/client/index.js' {
  export class Client {
    constructor(info: { name: string; version: string }, capabilities: Record<string, unknown>);
    connect(transport: unknown): Promise<void>;
    close(): Promise<void>;
    callTool(args: { name: string; arguments?: Record<string, unknown> }): Promise<unknown>;
  }
}

declare module '@modelcontextprotocol/sdk/client/stdio.js' {
  export class StdioClientTransport {
    constructor(options: { command: string; args?: string[] });
  }
}