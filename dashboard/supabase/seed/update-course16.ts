/**
 * Update Script — Course 16 (Preparing for an Inspection Audit)
 *
 * Updates course 16 in Supabase: sets slug, status=Complete, progress=100, and meta.
 * The pre-built .docx at public/docs/course-16-preparing-for-an-inspection-audit.docx is served directly.
 *
 * Usage:
 *   cd dashboard
 *   npx tsx supabase/seed/update-course16.ts
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
  title: "Preparing for an Inspection Audit",
  subtitle: "Staying Audit-Ready Every Day on a Canadian Poultry Farm",
  organization: "CPC Short Courses",
  date: "July 2026",
  version: "1.0",
  disclaimer: "This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from national on-farm assurance programs, regulatory standards, industry guides, and the CPC Learning Centre. It does not replace the official program manuals, the advice of your provincial marketing board, or the direction of a licensed veterinarian or regulatory authority. Always follow the current version of the program you are audited under. The CPC team reviews and updates this series. If you spot something that needs correcting, tell us at admin@canadianpoultry.ca.",
}

async function run() {
  console.log('Updating Course 16 in Supabase…')

  const { data, error } = await supabase
    .from('courses')
    .update({
      slug: 'course-16-preparing-for-an-inspection-audit',
      status: 'Complete',
      progress_pct: 100,
      meta: META,
      updated_at: new Date().toISOString(),
    })
    .eq('course_number', 16)
    .select()

  if (error) {
    console.error('Failed to update course 16:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error('Course 16 row not found — run the main seed first (npm run seed)')
    process.exit(1)
  }

  console.log('Course 16 updated successfully')
  console.log('   ID:     ', data[0].id)
  console.log('   Slug:   ', data[0].slug)
  console.log('   Status: ', data[0].status)
}

run()
