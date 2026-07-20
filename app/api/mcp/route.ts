import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, serverName, serverUrl, description } = body;

    if (action === 'add') {
      // MCP 서버 추가 로직
      return NextResponse.json({
        success: true,
        message: `MCP server "${serverName}" added successfully`,
        server: {
          id: `mcp-${Date.now()}`,
          name: serverName,
          url: serverUrl,
          description,
          enabled: true,
          createdAt: new Date().toISOString()
        }
      });
    } else if (action === 'remove') {
      // MCP 서버 제거 로직
      return NextResponse.json({
        success: true,
        message: 'MCP server removed successfully'
      });
    } else if (action === 'toggle') {
      // MCP 서버 활성화/비활성화 로직
      return NextResponse.json({
        success: true,
        message: 'MCP server toggled successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('MCP API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'MCP operation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 등록된 MCP 서버 목록 반환
    return NextResponse.json({
      servers: [
        {
          id: 'mcp-1',
          name: 'Web Search',
          url: 'stdio://web-search',
          description: 'DuckDuckGo web search tool',
          enabled: true,
          createdAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('MCP listing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list MCP servers' },
      { status: 500 }
    );
  }
}
