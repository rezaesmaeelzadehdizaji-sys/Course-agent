import { createClient } from '@/lib/supabase/server'
import CourseGrid from '@/components/CourseGrid'
import type { Course } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = createClient()

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

  const complete = (courses as Course[]).filter(c => c.status === 'Complete').length
  const inProgress = (courses as Course[]).filter(c => c.status === 'In Progress').length

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1F3864] mb-1">
          All Courses
        </h1>
        <p className="text-sm text-gray-500">
          Canadian Poultry Training Series · 17 courses total
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
            {17 - complete - inProgress} Planned
          </span>
        </div>
      </div>

      <CourseGrid courses={courses as Course[]} />
    </div>
  )
}
