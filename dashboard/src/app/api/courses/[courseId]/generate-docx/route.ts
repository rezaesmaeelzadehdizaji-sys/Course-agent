import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { generateDocument } from '@/lib/doc-generator'
import type { DocCourseContent, DocReferences, Course, Section, Introduction, JournalSection, Reference } from '@/lib/types'

export async function POST(
  _request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const courseId = params.courseId

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

    const slug = course.slug ?? `course-${String(course.course_number).padStart(2, '0')}`
    const filename = `${slug}.docx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Document generation failed'
    return new NextResponse(message, { status: 500 })
  }
}
