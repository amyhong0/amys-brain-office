import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MCP Host - AI Agent Platform",
  description: "MCP-host tool based AI agent platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">{children}</body>
    </html>
  )
}
