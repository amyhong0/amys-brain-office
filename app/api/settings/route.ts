import { NextRequest, NextResponse } from 'next/server'

interface Settings {
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
}

const defaultSettings: Settings = {
  model: 'qwen/qwen3-next-80b-a3b-instruct',
  systemPrompt: 'You are a helpful AI assistant.',
  temperature: 0.2,
  maxTokens: 400
}

// In-memory storage (replace with database in production)
let settings: Settings = { ...defaultSettings }

export async function GET() {
  return NextResponse.json(settings)
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  settings = { ...settings, ...body }
  return NextResponse.json(settings)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  settings = { ...defaultSettings, ...body }
  return NextResponse.json(settings)
}
