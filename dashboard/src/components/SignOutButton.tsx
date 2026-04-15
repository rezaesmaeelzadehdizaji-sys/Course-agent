'use client'

import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-blue-200 hover:text-white transition-colors"
    >
      Sign out
    </button>
  )
}
