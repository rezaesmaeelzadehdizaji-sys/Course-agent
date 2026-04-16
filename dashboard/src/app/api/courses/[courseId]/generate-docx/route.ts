import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
// Note: binary response uses global Response (broader BodyInit support than NextResponse)
import { generateDocument } from '@/lib/doc-generator'
import type { DocCourseContent, DocReferences, Course, Section, Introduction, JournalSection, Reference } from '@/lib/types'

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // courseId already destructured from awaited params above

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
    const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    const blob = new Blob([arrayBuffer], { type: DOCX_MIME })

    const slug = course.slug ?? `course-${String(course.course_number).padStart(2, '0')}`
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
