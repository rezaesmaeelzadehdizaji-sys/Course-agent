import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'T-FLAWS Course Dashboard',
  description: 'Canadian Poultry Training Series — Course Management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F7FA]">{children}</body>
    </html>
  )
}
