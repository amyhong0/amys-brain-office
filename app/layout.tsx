import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Amy's Brain Office",
  description: "개인 지식 관리 시스템",
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
