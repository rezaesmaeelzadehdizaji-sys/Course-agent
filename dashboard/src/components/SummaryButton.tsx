'use client'

import { createClient } from '@/lib/supabase/browser'

interface Props {
  courseNumber: number
  title?: string
}

export default function SummaryButton({ courseNumber, title }: Props) {
  const nn = String(courseNumber).padStart(2, '0')
  const url = `/docs/course-${nn}-summary.docx`

  async function handleClick() {
    // Best-effort download alert — never blocks the download.
    try {
      const { data: { session } } = await createClient().auth.getSession()
      const token = session?.access_token
      if (token) {
        await fetch('/api/notify-download', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseNumber, kind: 'Summary', title }),
        })
      }
    } catch { /* ignore */ }

    const a = document.createElement('a')
    a.href = url
    a.download = `course-${nn}-summary.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <button
      onClick={handleClick}
      title="Download course summary page"
      className="text-xs font-medium text-white bg-[#1F3864] hover:bg-[#2E74B5] py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Summary</span>
    </button>
  )
}
