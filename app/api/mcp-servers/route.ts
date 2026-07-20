import { NextRequest, NextResponse } from 'next/server'

interface MCPServer {
  id: string
  name: string
  url: string
  enabled: boolean
  description?: string
}

// In-memory storage (replace with database in production)
let mcpServers: MCPServer[] = [
  {
    id: '1',
    name: 'File System',
    url: 'stdio://file-system',
    enabled: true,
    description: 'File system operations'
  }
]

export async function GET() {
  return NextResponse.json(mcpServers)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, url, description } = body

  const newServer: MCPServer = {
    id: Date.now().toString(),
    name,
    url,
    enabled: true,
    description
  }

  mcpServers.push(newServer)
  return NextResponse.json(newServer, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Server ID is required' }, { status: 400 })
  }

  mcpServers = mcpServers.filter(server => server.id !== id)
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Server ID is required' }, { status: 400 })
  }

  const serverIndex = mcpServers.findIndex(server => server.id === id)
  if (serverIndex === -1) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  mcpServers[serverIndex] = { ...mcpServers[serverIndex], ...body }
  return NextResponse.json(mcpServers[serverIndex])
}
