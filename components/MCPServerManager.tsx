'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Power, PowerOff } from 'lucide-react'

interface MCPServer {
  id: string
  name: string
  url: string
  enabled: boolean
  description?: string
}

export default function MCPServerManager() {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newServer, setNewServer] = useState({ name: '', url: '', description: '' })

  useEffect(() => {
    fetch('/api/mcp-servers')
      .then(res => res.json())
      .then(data => setServers(data))
  }, [])

  const addServer = async () => {
    const response = await fetch('/api/mcp-servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newServer)
    })
    const server = await response.json()
    setServers([...servers, server])
    setNewServer({ name: '', url: '', description: '' })
    setShowAddForm(false)
  }

  const deleteServer = async (id: string) => {
    await fetch(`/api/mcp-servers?id=${id}`, { method: 'DELETE' })
    setServers(servers.filter(s => s.id !== id))
  }

  const toggleServer = async (id: string, enabled: boolean) => {
    const response = await fetch(`/api/mcp-servers?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !enabled })
    })
    const updated = await response.json()
    setServers(servers.map(s => s.id === id ? updated : s))
  }

  return (
    <div className="border rounded-lg bg-muted/5">
      <div className="flex items-center justify-between p-3 border-b bg-muted/10">
        <h3 className="font-semibold text-sm">MCP Servers</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 hover:bg-muted rounded-md"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 border-b space-y-3">
          <input
            type="text"
            placeholder="Server name"
            value={newServer.name}
            onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Server URL"
            value={newServer.url}
            onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newServer.description}
            onChange={(e) => setNewServer({ ...newServer, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={addServer}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Add Server
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="divide-y max-h-96 overflow-y-auto">
        {servers.map(server => (
          <div key={server.id} className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{server.name}</p>
                  {server.enabled ? (
                    <Power className="w-3 h-3 text-green-500" />
                  ) : (
                    <PowerOff className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{server.url}</p>
                {server.description && (
                  <p className="text-xs text-muted-foreground mt-1">{server.description}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleServer(server.id, server.enabled)}
                  className="p-1 hover:bg-muted rounded"
                  title={server.enabled ? 'Disable' : 'Enable'}
                >
                  {server.enabled ? (
                    <Power className="w-4 h-4" />
                  ) : (
                    <PowerOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => deleteServer(server.id)}
                  className="p-1 hover:bg-destructive/20 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {servers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No MCP servers configured
          </div>
        )}
      </div>
    </div>
  )
}
