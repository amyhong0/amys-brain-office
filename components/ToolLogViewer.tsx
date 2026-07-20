'use client'

import { useState, useEffect } from 'react'
import { Terminal, ChevronDown, ChevronRight } from 'lucide-react'

interface ToolCall {
  name: string
  arguments: Record<string, unknown>
  timestamp: string
  result?: unknown
}

export default function ToolLogViewer() {
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // In a real app, this would come from the conversation API
    const mockCalls: ToolCall[] = [
      {
        name: 'search_docs',
        arguments: { query: 'vacation policy', k: 2 },
        timestamp: new Date().toISOString(),
        result: [{ id: 'vacation', text: '연차는 사용 3영업일 전에 신청한다.' }]
      }
    ]
    setToolCalls(mockCalls)
  }, [])

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="border rounded-lg bg-muted/5">
      <div className="flex items-center gap-2 p-3 border-b bg-muted/10">
        <Terminal className="w-4 h-4" />
        <h3 className="font-semibold text-sm">Tool Calls</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {toolCalls.length} calls
        </span>
      </div>
      
      <div className="divide-y max-h-96 overflow-y-auto">
        {toolCalls.map((call, index) => (
          <div key={index} className="p-3">
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded p-1"
              onClick={() => toggleExpand(index.toString())}
            >
              {expanded[index.toString()] ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="font-mono text-sm">{call.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(call.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            {expanded[index.toString()] && (
              <div className="mt-2 ml-6 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Arguments:</p>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(call.arguments, null, 2)}
                  </pre>
                </div>
                {call.result ? (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Result:</p>
                    <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(call.result, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
        
        {toolCalls.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No tool calls yet
          </div>
        )}
      </div>
    </div>
  )
}
