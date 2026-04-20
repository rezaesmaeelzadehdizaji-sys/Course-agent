/**
 * Update Script — Course 7 (Common Poultry Diseases)
 *
 * Updates course 7 in Supabase: sets slug, status=Complete, progress=100, and meta.
 * The pre-built .docx at public/docs/course-07-common-poultry-diseases.docx is served directly.
 *
 * Usage:
 *   cd dashboard
 *   npx ts-node --esm supabase/seed/update-course07.ts
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
  title: "Common Poultry Diseases — Practical Training for Farmers",
  subtitle: "A Comprehensive Disease Recognition and Management Guide for Canadian Commercial Poultry Producers",
  organization: "Canadian Poultry Training Series",
  date: "April 2026",
  version: "1.0",
  disclaimer: "This course is intended for educational purposes. Always consult a licensed veterinarian for disease diagnosis and treatment decisions.",
}

async function run() {
  console.log('Updating Course 7 in Supabase…')

  const { data, error } = await supabase
    .from('courses')
    .update({
      slug: 'course-07-common-poultry-diseases',
      status: 'Complete',
      progress_pct: 100,
      meta: META,
      updated_at: new Date().toISOString(),
    })
    .eq('course_number', 7)
    .select()

  if (error) {
    console.error('❌ Failed to update course 7:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error('❌ Course 7 row not found — run the main seed first (npm run seed)')
    process.exit(1)
  }

  console.log('✅ Course 7 updated successfully')
  console.log('   ID:     ', data[0].id)
  console.log('   Slug:   ', data[0].slug)
  console.log('   Status: ', data[0].status)
}

run()
