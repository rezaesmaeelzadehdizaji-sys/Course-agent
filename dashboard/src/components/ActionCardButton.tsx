'use client'

import { createClient } from '@/lib/supabase/browser'

interface Props {
  courseNumber: number
  title?: string
}

// One-page emergency action card, served statically from public/docs.
// Mirrors SummaryButton; the only differences are the filename, the label,
// the notify-download kind, and the gold accent that marks it as the
// pin-it-up emergency sheet rather than a course document.
export default function ActionCardButton({ courseNumber, title }: Props) {
  const nn = String(courseNumber).padStart(2, '0')
  const file = `course-${nn}-first-24-hours.docx`
  const url = `/docs/${file}`

  async function handleClick() {
    // Best-effort download alert — never blocks the download.
    try {
      const { data: { session } } = await createClient().auth.getSession()
      const token = session?.access_token
      if (token) {
        await fetch('/api/notify-download', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseNumber, kind: 'ActionCard', title }),
        })
      }
    } catch { /* ignore */ }

    const a = document.createElement('a')
    a.href = url
    a.download = file
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <button
      onClick={handleClick}
      title="Download the one-page Avian Influenza: The First 24 Hours action card"
      className="text-xs font-medium text-white bg-[#C9A84C] hover:bg-[#b3923d] py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>First 24 Hours</span>
    </button>
  )
}
