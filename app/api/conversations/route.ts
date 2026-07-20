import { NextRequest, NextResponse } from 'next/server'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  timestamp: string
  toolCall?: {
    name: string
    arguments: Record<string, unknown>
  }
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

// In-memory storage (replace with database in production)
let conversations: Conversation[] = []

export async function GET() {
  return NextResponse.json(conversations)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, messages = [] } = body

  const newConversation: Conversation = {
    id: Date.now().toString(),
    title: title || 'New Conversation',
    messages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  conversations.push(newConversation)
  return NextResponse.json(newConversation, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
  }

  conversations = conversations.filter(conv => conv.id !== id)
  return NextResponse.json({ success: true })
}
