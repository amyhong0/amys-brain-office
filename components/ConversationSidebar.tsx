'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Plus, Trash2 } from 'lucide-react'

interface Conversation {
  id: string
  title: string
  messages: any[]
  createdAt: string
  updatedAt: string
}

export default function ConversationSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => setConversations(data))
  }, [])

  const createNewConversation = async () => {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Conversation' })
    })
    const newConv = await response.json()
    setConversations([...conversations, newConv])
    setSelectedId(newConv.id)
  }

  const deleteConversation = async (id: string) => {
    await fetch(`/api/conversations?id=${id}`, { method: 'DELETE' })
    setConversations(conversations.filter(c => c.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="w-64 border-r bg-muted/10 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Conversations</h2>
        <button
          onClick={createNewConversation}
          className="p-2 hover:bg-muted rounded-md"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`p-3 rounded-md cursor-pointer transition-colors ${
              selectedId === conv.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            onClick={() => setSelectedId(conv.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteConversation(conv.id)
                }}
                className="p-1 hover:bg-destructive/20 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
