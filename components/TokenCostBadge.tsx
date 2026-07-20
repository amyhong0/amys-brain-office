'use client'

import { useState, useEffect } from 'react'
import { Coins, DollarSign } from 'lucide-react'

interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
}

export default function TokenCostBadge() {
  const [usage, setUsage] = useState<TokenUsage>({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cost: 0
  })

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockUsage: TokenUsage = {
      inputTokens: 1250,
      outputTokens: 890,
      totalTokens: 2140,
      cost: 0.0128
    }
    setUsage(mockUsage)
  }, [])

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1 text-muted-foreground">
        <Coins className="w-4 h-4" />
        <span>{usage.totalTokens.toLocaleString()} tokens</span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <DollarSign className="w-4 h-4" />
        <span>{formatCost(usage.cost)}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        ({usage.inputTokens} in / {usage.outputTokens} out)
      </div>
    </div>
  )
}
