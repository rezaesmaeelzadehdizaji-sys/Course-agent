import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
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

  // Fetch course row first (need slug before parallel fetch)
  const courseRes = await supabase.from('courses').select('*').eq('id', courseId).single()
  if (courseRes.error || !courseRes.data) {
    return new NextResponse('Course not found', { status: 404 })
  }
  const course = courseRes.data as Course
  const slug = course.slug ?? `course-${String(course.course_number).padStart(2, '0')}`

  // If a pre-built .docx exists as a static asset, fetch it from the CDN and return it.
  // This completely bypasses doc generation for finalized courses.
  // The file lives at public/docs/{slug}.docx and is served by Vercel's CDN.
  const origin = new URL(request.url).origin
  const staticDocUrl = `${origin}/docs/${slug}.docx`
  const staticRes = await fetch(staticDocUrl, { method: 'HEAD' })
  if (staticRes.ok) {
    const docRes = await fetch(staticDocUrl)
    const docBuffer = Buffer.from(await docRes.arrayBuffer())
    return new Response(docBuffer, {
      status: 200,
      headers: {
        'Content-Type': DOCX_MIME,
        'Content-Disposition': `attachment; filename="${slug}.docx"`,
        'Content-Length': String(docBuffer.length),
      },
    })
  }

  // No static file — generate from DB content
  const [sectionsRes, introRes, journalRes, refsRes] = await Promise.all([
    supabase.from('sections').select('*').eq('course_id', courseId).order('sort_order'),
    supabase.from('introductions').select('*').eq('course_id', courseId).single(),
    supabase.from('journal_sections').select('*').eq('course_id', courseId).single(),
    supabase.from('references').select('*').eq('course_id', courseId).order('sort_order'),
  ])

  if (introRes.error || !introRes.data) {
    return new NextResponse('Introduction not found — please add content first', { status: 404 })
  }
  if (journalRes.error || !journalRes.data) {
    return new NextResponse('Journal section not found — please add content first', { status: 404 })
  }

  const sections = (sectionsRes.data ?? []) as Section[]
  const intro = introRes.data as Introduction
  const journal = journalRes.data as JournalSection
  const refs = (refsRes.data ?? []) as Reference[]

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

  const referenceEntries: DocReferences['referenceEntries'] = {}
  const bibliographyOrder: string[] = []
  refs.forEach((r) => {
    referenceEntries[r.ref_key] = { apa: r.apa, short: r.short }
    bibliographyOrder.push(r.ref_key)
  })

  try {
    const buffer = await generateDocument(courseContent, { referenceEntries, bibliographyOrder })
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: DOCX_MIME })

    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': DOCX_MIME,
        'Content-Disposition': `attachment; filename="${slug}.docx"`,
        'Content-Length': String(blob.size),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Document generation failed'
    return new NextResponse(message, { status: 500 })
  }
}
