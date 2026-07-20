'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, RotateCcw } from 'lucide-react'

interface Settings {
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    model: 'qwen/qwen3-next-80b-a3b-instruct',
    systemPrompt: 'You are a helpful AI assistant.',
    temperature: 0.2,
    maxTokens: 400
  })

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
  }, [])

  const saveSettings = async () => {
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
  }

  const resetSettings = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const response = await fetch('/api/settings')
    const data = await response.json()
    setSettings(data)
  }

  return (
    <div className="border rounded-lg bg-muted/5">
      <div className="flex items-center justify-between p-3 border-b bg-muted/10">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <h3 className="font-semibold text-sm">Model Settings</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetSettings}
            className="p-2 hover:bg-muted rounded-md"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={saveSettings}
            className="p-2 hover:bg-muted rounded-md"
            title="Save settings"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <input
            type="text"
            value={settings.model}
            onChange={(e) => setSettings({ ...settings, model: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">System Prompt</label>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm h-24 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Temperature</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Tokens</label>
            <input
              type="number"
              min="1"
              value={settings.maxTokens}
              onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
