/**
 * Update Script — Course 8 (Fundamentals of Poultry Vaccination & Treatment)
 *
 * Updates course 8 in Supabase: sets slug, status=Complete, progress=100, and meta.
 * The pre-built .docx at public/docs/course-08-vaccination-treatment.docx is served directly.
 *
 * Usage:
 *   cd dashboard
 *   npx ts-node --esm supabase/seed/update-course08.ts
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
  title: "Fundamentals of Poultry Vaccination & Treatment",
  subtitle: "Practical Vaccination and Treatment Training for Canadian Poultry Farms",
  organization: "CPC Short Courses",
  date: "June 2026",
  version: "1.0",
  disclaimer: "This course is intended for educational purposes. Always consult a licensed veterinarian for disease diagnosis and treatment decisions.",
}

async function run() {
  console.log('Updating Course 8 in Supabase…')

  const { data, error } = await supabase
    .from('courses')
    .update({
      slug: 'course-08-vaccination-treatment',
      status: 'Complete',
      progress_pct: 100,
      meta: META,
      updated_at: new Date().toISOString(),
    })
    .eq('course_number', 8)
    .select()

  if (error) {
    console.error('Failed to update course 8:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error('Course 8 row not found — run the main seed first (npm run seed)')
    process.exit(1)
  }

  console.log('Course 8 updated successfully')
  console.log('   ID:     ', data[0].id)
  console.log('   Slug:   ', data[0].slug)
  console.log('   Status: ', data[0].status)
}

run()
