/**
 * Update Script — Course 14 (Intro to Field Service)
 *
 * Updates course 14 in Supabase: sets slug, status=Complete, progress=100, and meta.
 * The pre-built .docx at public/docs/course-14-intro-to-field-service.docx is served directly.
 *
 * Usage:
 *   cd dashboard
 *   npx tsx supabase/seed/update-course14.ts
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
  title: "Intro to Field Service",
  subtitle: "Practical Skills for Barn Visits, Flock Assessment, and Working with Farmers",
  organization: "CPC Short Courses",
  date: "July 2026",
  version: "1.0",
  disclaimer: "This course is produced by the CPC Learning Centre for educational purposes. Content is intended for trained poultry industry professionals. It does not replace the advice of a licensed veterinarian, integrator management manuals, or regulatory requirements. Always follow current CFIA, NFACC, and integrator-specific protocols.",
}

async function run() {
  console.log('Updating Course 14 in Supabase…')

  const { data, error } = await supabase
    .from('courses')
    .update({
      slug: 'course-14-intro-to-field-service',
      status: 'Complete',
      progress_pct: 100,
      meta: META,
      updated_at: new Date().toISOString(),
    })
    .eq('course_number', 14)
    .select()

  if (error) {
    console.error('Failed to update course 14:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error('Course 14 row not found — run the main seed first (npm run seed)')
    process.exit(1)
  }

  console.log('Course 14 updated successfully')
  console.log('   ID:     ', data[0].id)
  console.log('   Slug:   ', data[0].slug)
  console.log('   Status: ', data[0].status)
}

run()
