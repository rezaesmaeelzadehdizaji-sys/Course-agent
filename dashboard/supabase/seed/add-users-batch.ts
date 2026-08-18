/**
 * Create dashboard logins for a batch of emails (same shared password).
 * Idempotent: existing users have their password reset and email confirmed.
 *
 *   cd dashboard
 *   npx tsx supabase/seed/add-users-batch.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

const PASSWORD = 'Cpc@shortcourses'
const EMAILS = [
  'mike.mcilwee@canadianpoultry.ca',
  'liam.ritchie@canadianpoultry.ca',
  'kay.dewet@canadianpoultry.ca',
  'victoria.bowes@canadianpoultry.ca',
  'ddykshorn@abbvet.ca',
]

async function upsertUser(email: string) {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  })

  if (!error) {
    console.log(`created:  ${email}`)
    return
  }

  if (/already been registered|already exists/i.test(error.message)) {
    const { data: list } = await supabase.auth.admin.listUsers()
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (!existing) {
      console.error(`FAILED (exists but not found): ${email}`)
      return
    }
    const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password: PASSWORD,
      email_confirm: true,
    })
    console.log(updErr ? `FAILED update: ${email} — ${updErr.message}` : `updated:  ${email}`)
    return
  }

  console.error(`FAILED:   ${email} — ${error.message}`)
}

async function run() {
  for (const email of EMAILS) {
    await upsertUser(email)
  }
  console.log('Done.')
}

run()
