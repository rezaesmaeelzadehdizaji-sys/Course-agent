/**
 * Update Script — Course 17 (Regulatory Framework in Poultry Production)
 *
 * Updates course 17 in Supabase: sets slug, status=Complete, progress=100, and meta.
 * The pre-built .docx at public/docs/course-17-regulatory-framework-in-poultry-production.docx
 * is served directly by the generate-docx route's static-path shortcut.
 *
 * Usage:
 *   cd dashboard
 *   npx tsx supabase/seed/update-course17.ts
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
  title: "Regulatory Framework in Poultry Production",
  subtitle: "Understanding the Rules That Govern Poultry Farming in Canada",
  organization: "CPC Short Courses",
  date: "August 2026",
  version: "1.0",
  disclaimer: "This course has been developed for educational purposes for commercial poultry farmers in Canada. It summarizes federal and provincial laws, national supply management, industry codes, and on-farm assurance programs as a general guide. It does not replace the official text of any act or regulation, the manuals of the program you are audited under, the direction of your provincial marketing board, or the advice of a licensed veterinarian or regulatory authority. Always follow the current version of the law and program that applies to your farm. The CPC team reviews and updates this series. If you spot something that needs correcting, tell us at admin@canadianpoultry.ca.",
}

async function run() {
  console.log('Updating Course 17 in Supabase…')

  const { data, error } = await supabase
    .from('courses')
    .update({
      slug: 'course-17-regulatory-framework-in-poultry-production',
      status: 'Complete',
      progress_pct: 100,
      meta: META,
      updated_at: new Date().toISOString(),
    })
    .eq('course_number', 17)
    .select()

  if (error) {
    console.error('Failed to update course 17:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error('Course 17 row not found — run the main seed first (npm run seed)')
    process.exit(1)
  }

  console.log('Course 17 updated successfully')
  console.log('   ID:     ', data[0].id)
  console.log('   Slug:   ', data[0].slug)
  console.log('   Status: ', data[0].status)
}

run()
