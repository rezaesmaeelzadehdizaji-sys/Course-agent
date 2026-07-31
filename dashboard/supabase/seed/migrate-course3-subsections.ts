/**
 * One-off migration: convert Course 3 (T-FLAWS) section rows from the legacy
 * fixed-object subsections shape:
 *   { whatItIs, whyItMatters, howToAssess, abnormalFindings, managementResponses }
 * to the generalized ordered-array shape:
 *   [{ heading, paragraphs, imagePlaceholder? }, ...]
 *
 * Idempotent: if a row is already an array, it is left untouched.
 *
 *   cd dashboard
 *   npx tsx supabase/seed/migrate-course3-subsections.ts
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

const ORDER = ['whatItIs', 'whyItMatters', 'howToAssess', 'abnormalFindings', 'managementResponses'] as const

async function run() {
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 't-flaws-assessment-management-tool')
    .single()

  if (!course) {
    console.error('Course 3 (t-flaws) not found')
    process.exit(1)
  }

  const { data: sections, error } = await supabase
    .from('sections')
    .select('id, section_key, subsections')
    .eq('course_id', course.id)
    .order('sort_order')

  if (error) {
    console.error('Failed to load sections:', error.message)
    process.exit(1)
  }

  for (const s of sections ?? []) {
    const subs = s.subsections
    if (Array.isArray(subs)) {
      console.log(`  ${s.section_key}: already array (${subs.length}) — skipped`)
      continue
    }
    const arr = ORDER.filter((k) => subs?.[k]).map((k) => {
      const src = subs[k]
      const item: { heading: string; paragraphs: string[]; imagePlaceholder?: unknown } = {
        heading: src.heading ?? '',
        paragraphs: src.paragraphs ?? [],
      }
      if (src.imagePlaceholder) item.imagePlaceholder = src.imagePlaceholder
      return item
    })
    const { error: updErr } = await supabase.from('sections').update({ subsections: arr }).eq('id', s.id)
    if (updErr) {
      console.error(`  ${s.section_key}: update failed — ${updErr.message}`)
      process.exit(1)
    }
    console.log(`  ${s.section_key}: converted object → array (${arr.length} subsections)`)
  }

  console.log('Course 3 subsections migration complete.')
}

run()
