import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Course, Section, Introduction, JournalSection } from '@/lib/types'
import MetaEditor from '@/components/MetaEditor'
import SectionEditor from '@/components/SectionEditor'
import DownloadButton from '@/components/DownloadButton'

interface Props {
  params: Promise<{ courseId: string }>
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params
  const supabase = await createClient()

  const [courseRes, sectionsRes, introRes, journalRes] = await Promise.all([
    supabase.from('courses').select('*').eq('id', courseId).single(),
    supabase.from('sections').select('*').eq('course_id', courseId).order('sort_order'),
    supabase.from('introductions').select('*').eq('course_id', courseId).single(),
    supabase.from('journal_sections').select('*').eq('course_id', courseId).single(),
  ])

  if (courseRes.error || !courseRes.data) notFound()

  const course = courseRes.data as Course
  const sections = (sectionsRes.data ?? []) as Section[]
  const intro = introRes.data as Introduction | null
  const journal = journalRes.data as JournalSection | null

  const statusConfig = {
    Complete:      { bg: 'bg-green-100', text: 'text-green-700' },
    'In Progress': { bg: 'bg-amber-100', text: 'text-amber-700' },
    Planned:       { bg: 'bg-gray-100',  text: 'text-gray-500' },
  }
  const cfg = statusConfig[course.status as keyof typeof statusConfig]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center gap-2">
        <Link href="/dashboard" className="hover:text-[#2E74B5] transition-colors">
          All Courses
        </Link>
        <span>/</span>
        <span className="text-[#1F3864] font-medium">Course {course.course_number}</span>
      </nav>

      {/* Course header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold text-[#2E74B5] tracking-widest uppercase">
                Course {course.course_number} of 17
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                {course.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#1F3864]">
              {course.meta?.title ?? `Course ${course.course_number}`}
            </h1>
            {course.meta?.subtitle && (
              <p className="text-sm text-gray-500 mt-1">{course.meta.subtitle}</p>
            )}
          </div>
          {course.status === 'Complete' && (
            <DownloadButton courseId={course.id} courseNumber={course.course_number} slug={course.slug} updatedAt={course.updated_at} />
          )}
        </div>

        {/* Progress */}
        <div className="mt-4 space-y-1">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2E74B5] rounded-full transition-all"
              style={{ width: `${course.progress_pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">{course.progress_pct}% complete</p>
        </div>
      </div>

      {/* Meta editor */}
      <section>
        <h2 className="text-base font-semibold text-[#1F3864] mb-3">Course Metadata</h2>
        <MetaEditor course={course} />
      </section>

      {/* Introduction */}
      {intro && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#1F3864]">Introduction</h2>
            <Link
              href={`/dashboard/courses/${course.id}/sections/introduction`}
              className="text-xs text-[#2E74B5] hover:underline"
            >
              Edit →
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-sm font-medium text-gray-700">{intro.title}</p>
            <p className="text-xs text-gray-400 mt-1">
              {intro.paragraphs.length} paragraphs · {intro.subsections.length} subsections
            </p>
          </div>
        </section>
      )}

      {/* T-FLAWS Sections */}
      {sections.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-[#1F3864] mb-3">T-FLAWS Sections</h2>
          <div className="space-y-3">
            {sections.map((section) => (
              <SectionEditor key={section.id} section={section} courseId={course.id} />
            ))}
          </div>
        </section>
      )}

      {/* Journals */}
      {journal && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#1F3864]">Journals & Resources</h2>
            <Link
              href={`/dashboard/courses/${course.id}/sections/journals`}
              className="text-xs text-[#2E74B5] hover:underline"
            >
              Edit →
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-gray-400">
              {journal.journals.length} peer-reviewed journals · {journal.institutional_resources.length} institutional resources
            </p>
          </div>
        </section>
      )}

      {/* References link */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1F3864]">References</h2>
          <Link
            href={`/dashboard/courses/${course.id}/sections/references`}
            className="text-xs text-[#2E74B5] hover:underline"
          >
            Edit →
          </Link>
        </div>
      </section>
    </div>
  )
}
