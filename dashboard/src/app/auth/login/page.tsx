'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

type Mode = 'password' | 'magic'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#1F3864] text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-widest">
            COURSE 3 OF 17
          </div>
          <h1 className="text-2xl font-bold text-[#1F3864] mb-1">T-FLAWS Dashboard</h1>
          <p className="text-sm text-gray-500">Canadian Poultry Training Series</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">📬</div>
            <p className="text-[#1F3864] font-medium mb-2">Check your email</p>
            <p className="text-sm text-gray-500">
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </p>
            <button onClick={() => setSent(false)} className="mt-4 text-xs text-[#2E74B5] hover:underline">
              Back
            </button>
          </div>
        ) : (
          <>
            {/* Mode tabs */}
            <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
              <button
                onClick={() => { setMode('password'); setError('') }}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'password' ? 'bg-[#1F3864] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Password
              </button>
              <button
                onClick={() => { setMode('magic'); setError('') }}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'magic' ? 'bg-[#1F3864] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Magic Link
              </button>
            </div>

            {mode === 'password' ? (
              <form onSubmit={handlePassword} autoComplete="off" className="space-y-4">
                {/* Hidden honeypot fields to trick browser autofill */}
                <input type="text" name="fake_user" autoComplete="username" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true" tabIndex={-1} />
                <input type="password" name="fake_pass" autoComplete="current-password" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true" tabIndex={-1} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    name="tflaws_signin_email"
                    autoComplete="one-time-code"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5] focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    name="tflaws_signin_pass"
                    autoComplete="one-time-code"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5] focus:border-transparent"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full bg-[#1F3864] text-white font-medium py-2.5 rounded-lg text-sm hover:bg-[#2E74B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleMagicLink} autoComplete="off" className="space-y-4">
                {/* Hidden honeypot field to trick browser autofill */}
                <input type="text" name="fake_user_ml" autoComplete="username" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true" tabIndex={-1} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    name="tflaws_magic_email"
                    autoComplete="one-time-code"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5] focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#1F3864] text-white font-medium py-2.5 rounded-lg text-sm hover:bg-[#2E74B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending…' : 'Send Magic Link'}
                </button>
              </form>
            )}

          </>
        )}
      </div>
    </div>
  )
}
