import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// Emails that should NOT trigger a notification (the owner's own downloads).
const OWNER_EMAILS = new Set(['reza.esmaeelzadehdizaji@gmail.com'])

// Where download alerts are sent (same target as the login alerts).
const NOTIFY_TO = process.env.LOGIN_NOTIFY_TO || 'reza.esmaeelzadehdizaji@gmail.com'
const FROM = process.env.LOGIN_NOTIFY_FROM || 'CPC Dashboard <onboarding@resend.dev>'

export async function POST(request: NextRequest) {
  // Verify the caller holds a valid session (prevents spam).
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

  let body: { courseNumber?: number | string; kind?: string; title?: string } = {}
  try { body = await request.json() } catch { /* no body */ }
  const courseNumber = body.courseNumber ?? '?'
  const kind = body.kind === 'Summary' ? 'Summary page' : 'Main draft'
  const title = body.title ? String(body.title).slice(0, 200) : ''

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
        subject: `CPC Dashboard download: Course ${courseNumber} (${kind}) — ${email}`,
        text:
          `${email} downloaded a file from the CPC Short Courses dashboard.\n\n` +
          `Course: ${courseNumber}${title ? ` — ${title}` : ''}\n` +
          `File: ${kind}\n` +
          `Time (Pacific): ${when}\n` +
          `IP address: ${ip}\n` +
          `Device / browser: ${ua}\n`,
      }),
    })
    if (!res.ok) {
      const b = await res.text()
      return NextResponse.json({ ok: false, status: res.status, body: b })
    }
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'send failed' })
  }

  return NextResponse.json({ ok: true })
}
