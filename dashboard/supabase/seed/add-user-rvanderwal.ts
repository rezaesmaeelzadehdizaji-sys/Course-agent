/**
 * One-off: create a dashboard login for rvanderwal@abbvet.ca
 *
 *   cd dashboard
 *   npx tsx supabase/seed/add-user-rvanderwal.ts
 *
 * Uses the service-role key to create a confirmed Supabase Auth user so they
 * can sign in at /auth/login with email + password immediately.
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

const EMAIL = 'rvanderwal@abbvet.ca'
const PASSWORD = 'Cpc@shortcourses'

async function run() {
  console.log(`Creating dashboard user ${EMAIL}…`)

  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  })

  if (error) {
    // If the user already exists, update their password instead.
    if (/already been registered|already exists/i.test(error.message)) {
      console.log('User already exists — updating password and confirming email…')
      const { data: list } = await supabase.auth.admin.listUsers()
      const existing = list?.users.find(
        (u) => u.email?.toLowerCase() === EMAIL.toLowerCase(),
      )
      if (!existing) {
        console.error('Could not locate the existing user to update.')
        process.exit(1)
      }
      const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, {
        password: PASSWORD,
        email_confirm: true,
      })
      if (updErr) {
        console.error('Failed to update existing user:', updErr.message)
        process.exit(1)
      }
      console.log('Password updated for existing user')
      console.log('   ID:   ', existing.id)
      console.log('   Email:', existing.email)
      return
    }
    console.error('Failed to create user:', error.message)
    process.exit(1)
  }

  console.log('User created and email confirmed')
  console.log('   ID:   ', data.user?.id)
  console.log('   Email:', data.user?.email)
}

run()
