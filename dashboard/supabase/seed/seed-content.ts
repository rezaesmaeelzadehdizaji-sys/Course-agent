/**
 * Seed dashboard display content (introduction, sections + subsections, journals,
 * references) for one or more courses by extracting their pre-built .docx.
 *
 * Idempotent: existing content rows for a course are deleted and re-inserted.
 * Does NOT touch the courses row (status/meta/progress) or the download path
 * (downloads are served from the static public/docs/*.docx regardless).
 *
 *   cd dashboard
 *   npx tsx supabase/seed/seed-content.ts 7            # one course
 *   npx tsx supabase/seed/seed-content.ts 4 5 6 8 9    # several
 *   npx tsx supabase/seed/seed-content.ts all          # every course with a docx
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { extractDocxAsync, type ExtractedSubsection } from './extract-docx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

const DOCS_DIR = path.resolve(__dirname, '../../public/docs')
const REPO_ROOT = path.resolve(__dirname, '../../..')

// Courses whose source docx isn't a public/docs/course-NN-*.docx file.
const DOCX_OVERRIDE: Record<number, string> = {
  3: path.join(DOCS_DIR, 't-flaws-assessment-management-tool.docx'),
  // Course 17 published 2026-08-30. Pinned explicitly so the course-17-* prefix
  // match can never resolve to course-17-summary.docx.
  17: path.join(DOCS_DIR, 'course-17-regulatory-framework-in-poultry-production.docx'),
  // Course 18 re-seeded 2026-08-30 after the claims audit. Pinned for the same
  // reason as 17, so the course-18-* prefix can never resolve to the summary file.
  18: path.join(DOCS_DIR, 'course-18-current-poultry-issues-hot-topics.docx'),
}

function findDocx(courseNumber: number): string | null {
  if (DOCX_OVERRIDE[courseNumber]) {
    const p = DOCX_OVERRIDE[courseNumber]
    return fs.existsSync(p) ? p : null
  }
  const nn = String(courseNumber).padStart(2, '0')
  const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith('.docx'))
  const match = files.find((f) => f.startsWith(`course-${nn}-`))
  return match ? path.join(DOCS_DIR, match) : null
}

function cleanTitle(t: string): string {
  // strip a leading enumerator like "1. " / "Section 3: " so it doesn't duplicate the badge
  return t.replace(/^section\s+\d+\s*[:.\-]\s*/i, '').replace(/^\d+\s*[.:]\s*/, '').trim()
}

// A journal entry names the journal in its first few words, then a "(", ":" or ".".
// A prose lead-in sentence has a long run of words before any such separator.
function looksLikeJournalEntry(line: string): boolean {
  const head = line.split(/[:.(]/)[0].trim()
  return head.length > 0 && head.split(/\s+/).length <= 6
}

function parseJournalLine(line: string): { name: string; publisher: string; scope: string; issn: string } {
  const colonIdx = line.indexOf(': ')
  const dotIdx = line.indexOf('. ')
  if (colonIdx >= 0 && (dotIdx < 0 || colonIdx < dotIdx)) {
    // "Name (publisher): scope"
    let name = line.slice(0, colonIdx).trim()
    let publisher = ''
    const paren = name.match(/^(.*?)\s*\((.+)\)\s*$/)
    if (paren) {
      name = paren[1].trim()
      publisher = paren[2].trim()
    }
    return { name, publisher, scope: line.slice(colonIdx + 1).trim(), issn: '' }
  }
  // "Name. Publisher. scope" or bare "Name (Publisher)"
  const segs = line.split('. ')
  let name = (segs[0] || '').trim()
  let publisher = (segs[1] || '').trim()
  const scope = segs.slice(2).join('. ').trim()
  if (!publisher) {
    const paren = name.match(/^(.*?)\s*\((.+)\)\s*$/)
    if (paren) {
      name = paren[1].trim()
      publisher = paren[2].trim()
    }
  }
  return { name, publisher, scope, issn: '' }
}

// Split raw journal lines into a prose intro and parsed journal entries.
function splitJournals(lines: string[]): { intro: string; journals: Array<{ name: string; publisher: string; scope: string; issn: string }> } {
  const introParts: string[] = []
  const journals: Array<{ name: string; publisher: string; scope: string; issn: string }> = []
  let seenJournal = false
  for (const line of lines) {
    if (!seenJournal && !looksLikeJournalEntry(line)) {
      introParts.push(line)
      continue
    }
    seenJournal = true
    journals.push(parseJournalLine(line))
  }
  return { intro: introParts.join(' ').trim(), journals }
}

function toSubsectionRows(subs: ExtractedSubsection[]) {
  return subs
    .map((s) => ({ heading: s.heading, paragraphs: s.paragraphs }))
    .filter((s) => s.heading || s.paragraphs.length > 0)
}

async function seedCourse(courseNumber: number) {
  const docxPath = findDocx(courseNumber)
  if (!docxPath) {
    console.log(`C${courseNumber}: no docx in public/docs — skipped`)
    return
  }

  const { data: course, error: cErr } = await supabase
    .from('courses')
    .select('id, slug')
    .eq('course_number', courseNumber)
    .single()
  if (cErr || !course) {
    console.log(`C${courseNumber}: no courses row — skipped (${cErr?.message ?? 'not found'})`)
    return
  }

  const x = await extractDocxAsync(docxPath)

  // Wipe existing content rows for this course
  await supabase.from('references').delete().eq('course_id', course.id)
  await supabase.from('sections').delete().eq('course_id', course.id)
  await supabase.from('introductions').delete().eq('course_id', course.id)
  await supabase.from('journal_sections').delete().eq('course_id', course.id)

  // Introduction
  await supabase.from('introductions').insert({
    course_id: course.id,
    title: x.introduction.title || 'Introduction',
    paragraphs: x.introduction.paragraphs,
    subsections: toSubsectionRows(x.introduction.subsections),
  })

  // Sections. A "X: Title" heading (T-FLAWS acronym) keeps its letter badge;
  // otherwise letter = ' ' and the UI shows the section ordinal instead.
  const sectionRows = x.sections
    .filter((s) => s.subsections.length > 0)
    .map((s, i) => {
      const lm = s.title.match(/^([A-Za-z]):\s+/)
      return {
        course_id: course.id,
        section_key: `sec-${i + 1}`,
        letter: lm ? lm[1].toUpperCase() : ' ',
        title: cleanTitle(s.title),
        full_title: cleanTitle(s.title),
        sort_order: i + 1,
        subsections: toSubsectionRows(s.subsections),
      }
    })
  if (sectionRows.length) await supabase.from('sections').insert(sectionRows)

  // Journals — only create the card when the course actually has a journals section.
  const { intro: jIntro, journals } = splitJournals(x.journals)
  if (journals.length > 0 || jIntro) {
    await supabase.from('journal_sections').insert({
      course_id: course.id,
      title: 'Recommended Peer-Reviewed Journals',
      intro: jIntro,
      journals,
      institutional_resources: [],
    })
  }

  // References — drop the lead-in prose sentence (some courses number via Word's
  // list auto-numbering, so citation text has no "[N]"/"N." prefix to key off).
  // Strip a leading marker only when one is actually present.
  const REF_LEADIN = /^(references?\b.*(listed|below|order|following|drawn)|this course draws|the following (sources|references)|all sources are|sources are listed|listed in order)/i
  const refRows = x.references
    .filter((r) => r.length > 0 && !REF_LEADIN.test(r))
    .map((r) => r.replace(/^\s*\[?\d+\]?\s*[.):]\s+/, '').trim())
    .filter((r) => r.length > 0)
    .map((apa, i) => ({
      course_id: course.id,
      ref_key: `ref-${i + 1}`,
      apa,
      short: '',
      sort_order: i + 1,
    }))
  if (refRows.length) await supabase.from('references').insert(refRows)

  console.log(
    `C${courseNumber}: intro(${x.introduction.paragraphs.length}p/${toSubsectionRows(x.introduction.subsections).length}s) ` +
      `sections=${sectionRows.length} journals=${journals.length} refs=${refRows.length}  [${course.slug}]`,
  )
}

async function run() {
  const args = process.argv.slice(2)
  let numbers: number[]
  if (args.length === 0) {
    console.error('Usage: npx tsx supabase/seed/seed-content.ts <courseNumber...> | all')
    process.exit(1)
  }
  if (args[0] === 'all') {
    numbers = fs
      .readdirSync(DOCS_DIR)
      .map((f) => f.match(/^course-(\d{2})-/)?.[1])
      .filter(Boolean)
      .map((n) => Number(n))
      .sort((a, b) => a - b)
  } else {
    numbers = args.map((a) => Number(a)).filter((n) => Number.isFinite(n))
  }
  for (const n of numbers) {
    await seedCourse(n)
  }
  console.log('Done.')
}

run()
