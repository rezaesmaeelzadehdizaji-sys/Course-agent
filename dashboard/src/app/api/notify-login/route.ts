import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// Emails that should NOT trigger a notification (the owner's own logins).
const OWNER_EMAILS = new Set(['reza.esmaeelzadehdizaji@gmail.com'])

// Where login alerts are sent. Must be the Resend account's own address while
// sending from the unverified onboarding@resend.dev sender.
const NOTIFY_TO = process.env.LOGIN_NOTIFY_TO || 'reza.esmaeelzadehdizaji@gmail.com'
const FROM = process.env.LOGIN_NOTIFY_FROM || 'CPC Dashboard <onboarding@resend.dev>'

export async function POST(request: NextRequest) {
  // Verify the caller actually holds a valid session (prevents spam).
  const token = request.headers.get('Authorization')?.replace('Bearer ', '').trim()
  if (!token) return new NextResponse('Unauthorized', { status: 401 })

  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data: { user } } = await anon.auth.getUser(token)
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const email = (user.email ?? 'unknown').toLowerCase()
  if (OWNER_EMAILS.has(email)) return NextResponse.json({ skipped: 'owner' })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ ok: false, reason: 'RESEND_API_KEY not set' })

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const ua = request.headers.get('user-agent') || 'unknown'
  const when = new Date().toLocaleString('en-CA', { timeZone: 'America/Vancouver', hour12: false })

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [NOTIFY_TO],
        subject: `CPC Dashboard login: ${email}`,
        text:
          `${email} just signed in to the CPC Short Courses dashboard.\n\n` +
          `Time (Pacific): ${when}\n` +
          `IP address: ${ip}\n` +
          `Device / browser: ${ua}\n`,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json({ ok: false, status: res.status, body })
    }
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'send failed' })
  }

  return NextResponse.json({ ok: true })
}
