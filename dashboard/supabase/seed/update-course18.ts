/**
 * Update Script — Course 18 (Current Poultry Issues (Hot Topics))
 *
 * Inserts/updates course 18 in Supabase: sets slug, status=Complete, progress=100, meta.
 * The pre-built .docx at public/docs/course-18-current-poultry-issues-hot-topics.docx is served directly.
 *
 * PREREQUISITE: the courses.course_number CHECK constraint must allow 18.
 * The original schema capped it at 17. Run this once in the Supabase SQL editor first:
 *
 *   alter table courses drop constraint courses_course_number_check;
 *   alter table courses add constraint courses_course_number_check
 *     check (course_number between 1 and 99);
 *
 * Then run:
 *   cd dashboard
 *   npx tsx supabase/seed/update-course18.ts
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

const SLUG = 'course-18-current-poultry-issues-hot-topics'

const META = {
  title: 'Current Poultry Issues (Hot Topics)',
  subtitle: 'Avian Influenza and Emerging Disease Issues in Canadian Poultry',
  organization: 'CPC Short Courses',
  date: 'June 2026',
  version: '1.0',
  disclaimer:
    'This course covers current issues; disease figures and dates reflect mid-2026 and will change over time. Always confirm the present disease situation and reporting requirements with the CFIA and a licensed veterinarian.',
}

async function run() {
  console.log('Upserting Course 18 in Supabase…')

  const { data, error } = await supabase
    .from('courses')
    .upsert(
      {
        course_number: 18,
        slug: SLUG,
        status: 'Complete',
        progress_pct: 100,
        meta: META,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'course_number' },
    )
    .select()

  if (error) {
    console.error('Failed to upsert course 18:', error.message)
    if (error.message.includes('course_number_check')) {
      console.error('\nThe course_number CHECK constraint still caps at 17.')
      console.error('Run this in the Supabase SQL editor, then re-run this script:')
      console.error('  alter table courses drop constraint courses_course_number_check;')
      console.error('  alter table courses add constraint courses_course_number_check check (course_number between 1 and 99);')
    }
    process.exit(1)
  }

  console.log('Course 18 upserted successfully')
  console.log('   ID:     ', data?.[0]?.id)
  console.log('   Slug:   ', data?.[0]?.slug)
  console.log('   Status: ', data?.[0]?.status)
}

run()
