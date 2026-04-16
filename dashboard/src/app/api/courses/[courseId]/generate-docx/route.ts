import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
// Note: binary response uses global Response (broader BodyInit support than NextResponse)
import { generateDocument } from '@/lib/doc-generator'
import type { DocCourseContent, DocReferences, Course, Section, Introduction, JournalSection, Reference } from '@/lib/types'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params

  // Auth check via Bearer token sent from browser client
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '').trim()
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Verify token with anon client
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await anonClient.auth.getUser(token)
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Use service role client for data queries (bypasses RLS safely after auth check)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch all course data in parallel
  const [courseRes, sectionsRes, introRes, journalRes, refsRes] = await Promise.all([
    supabase.from('courses').select('*').eq('id', courseId).single(),
    supabase.from('sections').select('*').eq('course_id', courseId).order('sort_order'),
    supabase.from('introductions').select('*').eq('course_id', courseId).single(),
    supabase.from('journal_sections').select('*').eq('course_id', courseId).single(),
    supabase.from('references').select('*').eq('course_id', courseId).order('sort_order'),
  ])

  if (courseRes.error || !courseRes.data) {
    return new NextResponse('Course not found', { status: 404 })
  }
  if (introRes.error || !introRes.data) {
    return new NextResponse('Introduction not found — please add content first', { status: 404 })
  }
  if (journalRes.error || !journalRes.data) {
    return new NextResponse('Journal section not found — please add content first', { status: 404 })
  }

  const course = courseRes.data as Course
  const sections = (sectionsRes.data ?? []) as Section[]
  const intro = introRes.data as Introduction
  const journal = journalRes.data as JournalSection
  const refs = (refsRes.data ?? []) as Reference[]

  // Serve pre-built .docx if available (avoids generation for finalized courses)
  const slug = course.slug ?? `course-${String(course.course_number).padStart(2, '0')}`
  const staticPath = join(process.cwd(), 'public', 'docs', `${slug}.docx`)
  if (existsSync(staticPath)) {
    const fileBuffer = readFileSync(staticPath)
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': DOCX_MIME,
        'Content-Disposition': `attachment; filename="${slug}.docx"`,
        'Content-Length': String(fileBuffer.length),
      },
    })
  }

  // Reconstruct courseContent matching original JS shape
  const courseContent: DocCourseContent = {
    meta: {
      ...course.meta,
      courseNumber: `Course ${course.course_number} of 17`,
    },
    introduction: {
      title: intro.title,
      paragraphs: intro.paragraphs,
      subsections: intro.subsections,
    },
    sections: sections.map((s) => ({
      id: s.section_key,
      letter: s.letter,
      title: s.title,
      fullTitle: s.full_title,
      subsections: s.subsections,
    })),
    journalSection: {
      title: journal.title,
      intro: journal.intro,
      journals: journal.journals,
      institutionalResources: journal.institutional_resources,
    },
  }

  // Reconstruct references matching original JS shape
  const referenceEntries: DocReferences['referenceEntries'] = {}
  const bibliographyOrder: string[] = []

  refs.forEach((r) => {
    referenceEntries[r.ref_key] = { apa: r.apa, short: r.short }
    bibliographyOrder.push(r.ref_key)
  })

  const docReferences: DocReferences = { referenceEntries, bibliographyOrder }

  try {
    const buffer = await generateDocument(courseContent, docReferences)
    // Extract a plain ArrayBuffer (Buffer uses ArrayBufferLike which may be SharedArrayBuffer)
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: DOCX_MIME })
    const filename = `${slug}.docx`

    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': DOCX_MIME,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(blob.size),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Document generation failed'
    return new NextResponse(message, { status: 500 })
  }
}
