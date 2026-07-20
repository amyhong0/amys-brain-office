'use client'

import { Download } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export default function MarkdownExport({ conversation }: { conversation: Conversation | null }) {
  const exportToMarkdown = () => {
    if (!conversation) return

    let markdown = `# ${conversation.title}\n\n`
    markdown += `**Created:** ${new Date(conversation.createdAt).toLocaleString()}\n`
    markdown += `**Updated:** ${new Date(conversation.updatedAt).toLocaleString()}\n\n`
    markdown += `---\n\n`

    conversation.messages.forEach((msg) => {
      const role = msg.role === 'user' ? '👤 User' : msg.role === 'assistant' ? '🤖 Assistant' : '🔧 Tool'
      markdown += `### ${role}\n\n`
      markdown += `${msg.content}\n\n`
      markdown += `*${new Date(msg.timestamp).toLocaleString()}*\n\n`
      markdown += `---\n\n`
    })

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${conversation.title.replace(/\s+/g, '_')}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={exportToMarkdown}
      disabled={!conversation}
      className="p-2 hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      title="Export to Markdown"
    >
      <Download className="w-5 h-5" />
    </button>
  )
}
