/**
 * Update Script — Course 12 (Humane Euthanasia)
 *
 * Updates course 12 in Supabase: sets slug, status=Complete, progress=100, and meta.
 * The pre-built .docx at public/docs/course-12-humane-euthanasia.docx is served directly.
 *
 * Usage:
 *   cd dashboard
 *   npx tsx supabase/seed/update-course12.ts
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

const META = {
  title: "Humane Euthanasia",
  subtitle: "On-Farm Decision-Making, Methods, and Practical Skill",
  organization: "CPC Short Courses",
  date: "July 2026",
  version: "1.0",
  disclaimer: "This course is intended for educational purposes only. It does not replace the advice, diagnosis, or treatment of a licensed veterinarian. Euthanasia practices on your farm must comply with the NFACC Code of Practice and your applicable Chicken Farmers of Canada or provincial requirements. Always consult your veterinarian or flock advisor for the method appropriate to a specific situation.",
}

async function run() {
  console.log('Updating Course 12 in Supabase…')

  const { data, error } = await supabase
    .from('courses')
    .update({
      slug: 'course-12-humane-euthanasia',
      status: 'Complete',
      progress_pct: 100,
      meta: META,
      updated_at: new Date().toISOString(),
    })
    .eq('course_number', 12)
    .select()

  if (error) {
    console.error('Failed to update course 12:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error('Course 12 row not found — run the main seed first (npm run seed)')
    process.exit(1)
  }

  console.log('Course 12 updated successfully')
  console.log('   ID:     ', data[0].id)
  console.log('   Slug:   ', data[0].slug)
  console.log('   Status: ', data[0].status)
}

run()
