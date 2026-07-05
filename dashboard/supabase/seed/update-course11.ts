/**
 * Update Script — Course 11 (Necropsy of Common Diseases)
 *
 * Updates course 11 in Supabase: sets slug, status=Complete, progress=100, and meta.
 * The pre-built .docx at public/docs/course-11-necropsy-common-diseases.docx is served directly.
 *
 * Usage:
 *   cd dashboard
 *   npx tsx supabase/seed/update-course11.ts
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
  title: "Necropsy of Common Diseases",
  subtitle: "Reading Disease Lesions at the Necropsy Table",
  organization: "CPC Short Courses",
  date: "June 2026",
  version: "1.0",
  disclaimer: "This course is intended for educational purposes only. Necropsy and diagnosis are the work of a licensed veterinarian or pathologist, and this material does not replace their advice, diagnosis, or treatment. Always handle dead birds and tissues under your farm biosecurity plan, and consult your veterinarian for flock health decisions.",
}

async function run() {
  console.log('Updating Course 11 in Supabase…')

  const { data, error } = await supabase
    .from('courses')
    .update({
      slug: 'course-11-necropsy-common-diseases',
      status: 'Complete',
      progress_pct: 100,
      meta: META,
      updated_at: new Date().toISOString(),
    })
    .eq('course_number', 11)
    .select()

  if (error) {
    console.error('Failed to update course 11:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error('Course 11 row not found — run the main seed first (npm run seed)')
    process.exit(1)
  }

  console.log('Course 11 updated successfully')
  console.log('   ID:     ', data[0].id)
  console.log('   Slug:   ', data[0].slug)
  console.log('   Status: ', data[0].status)
}

run()
