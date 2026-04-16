import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

const ALLOWED_EMAIL = 'reza.esmaeelzadehdizaji@gmail.com'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // PKCE flow (Google OAuth + magic link)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/auth/login?error=oauth_error`)
    }
  }
  // OTP / token_hash flow (fallback)
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (error) {
      return NextResponse.redirect(`${origin}/auth/login?error=invalid_token`)
    }
  } else {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ALLOWED_EMAIL) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/auth/login?error=unauthorized`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
