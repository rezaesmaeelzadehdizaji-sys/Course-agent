/**
 * Append the series maintenance + feedback line to every course's meta.disclaimer.
 *
 * Surgical on purpose: it reads each course's existing meta, appends one sentence to
 * the disclaimer it already has, and writes back only the meta field. It does not
 * re-run the per-course update scripts, because those carry a full META object and
 * would overwrite title, subtitle, date and version with whatever was hardcoded when
 * they were written.
 *
 *   cd dashboard && npx tsx supabase/seed/append-feedback-line.ts
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
const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

const SENTENCE =
  ' The CPC team reviews and updates this series. If you spot something that needs correcting, tell us at admin@canadianpoultry.ca.'

async function run() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, course_number, slug, meta')
    .order('course_number')

  if (error) throw error
  if (!courses?.length) {
    console.log('No courses returned.')
    return
  }

  let updated = 0, skipped = 0, noDisclaimer = 0

  for (const c of courses) {
    const meta = (c.meta ?? {}) as Record<string, unknown>
    const disclaimer = typeof meta.disclaimer === 'string' ? meta.disclaimer : ''

    if (!disclaimer) {
      noDisclaimer++
      console.log(`  C${c.course_number}  no disclaimer in meta, skipped`)
      continue
    }
    if (disclaimer.includes('admin@canadianpoultry.ca')) {
      skipped++
      console.log(`  C${c.course_number}  already has the line`)
      continue
    }

    const next = { ...meta, disclaimer: disclaimer.trimEnd() + SENTENCE }
    const { error: upErr } = await supabase
      .from('courses')
      .update({ meta: next, updated_at: new Date().toISOString() })
      .eq('id', c.id)

    if (upErr) {
      console.log(`  C${c.course_number}  FAILED: ${upErr.message}`)
      continue
    }
    updated++
    console.log(`  C${c.course_number}  updated (${c.slug ?? 'no slug'})`)
  }

  console.log(`\nupdated: ${updated} | already done: ${skipped} | no disclaimer: ${noDisclaimer} | total rows: ${courses.length}`)
}

run().catch((e) => { console.error(e); process.exit(1) })
