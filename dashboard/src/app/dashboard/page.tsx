import { createClient } from '@/lib/supabase/server'
import CourseGrid from '@/components/CourseGrid'
import type { Course } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('course_number', { ascending: true })

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
        Failed to load courses: {error.message}
      </div>
    )
  }

  const dbCourses = (courses as Course[]) ?? []

  // Course 18 is served from a static pre-built .docx and is not stored in the
  // DB (the courses table CHECK constraint caps course_number at 17). Inject it
  // here so it renders as a Complete course with a working static download.
  // Skipped automatically if a real course 18 row is ever added to the DB.
  const STATIC_COURSES: Course[] = [
    {
      id: 'static-course-18',
      course_number: 18,
      slug: 'course-18-current-poultry-issues-hot-topics',
      status: 'Complete',
      progress_pct: 100,
      meta: {
        title: 'Current Poultry Issues (Hot Topics)',
        subtitle: 'Avian Influenza and Emerging Disease Issues in Canadian Poultry',
        organization: 'CPC Short Courses',
        date: 'June 2026',
        version: '1.0',
        disclaimer:
          'This course covers current issues; disease figures reflect mid-2026 and will change over time. Always confirm the current situation with the CFIA and a licensed veterinarian.',
      },
      created_at: '',
      updated_at: '2026-06-16T00:00:00.000Z',
    },
  ]
  const allCourses = [
    ...dbCourses,
    ...STATIC_COURSES.filter(s => !dbCourses.some(c => c.course_number === s.course_number)),
  ]

  const complete = allCourses.filter(c => c.status === 'Complete').length
  const inProgress = allCourses.filter(c => c.status === 'In Progress').length

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1F3864] mb-1">
          All Courses
        </h1>
        <p className="text-sm text-gray-500">
          CPC Short Courses · {allCourses.length} courses total
        </p>
        {/* Summary badges */}
        <div className="flex gap-3 mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
            {complete} Complete
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" />
            {inProgress} In Progress
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full inline-block" />
            {allCourses.length - complete - inProgress} Planned
          </span>
        </div>
      </div>

      <CourseGrid courses={allCourses} />
    </div>
  )
}
