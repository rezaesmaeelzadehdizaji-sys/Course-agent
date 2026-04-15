import Link from 'next/link'
import type { Course, CourseStatus } from '@/lib/types'
import DownloadButton from './DownloadButton'

interface Props {
  course: Course
}

const statusConfig: Record<CourseStatus, { label: string; bg: string; text: string; dot: string }> = {
  Complete:    { label: 'Complete',    bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  'In Progress': { label: 'In Progress', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  Planned:     { label: 'Planned',     bg: 'bg-gray-100',  text: 'text-gray-500',  dot: 'bg-gray-400' },
}

export default function CourseCard({ course }: Props) {
  const cfg = statusConfig[course.status]
  const title = course.meta?.title ?? `Course ${course.course_number}`

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-[#2E74B5] tracking-widest uppercase">
          Course {course.course_number}
        </span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} whitespace-nowrap`}>
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-[#1F3864] leading-snug line-clamp-2">
        {title}
      </h3>

      {/* Progress bar */}
      <div className="mt-auto space-y-1">
        <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
          <div
            className="h-full bg-[#2E74B5] rounded-full transition-all"
            style={{ width: `${course.progress_pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">{course.progress_pct}% complete</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <Link
          href={`/dashboard/courses/${course.id}`}
          className="flex-1 text-center text-xs font-medium text-[#2E74B5] hover:text-[#1F3864] py-1.5 border border-[#2E74B5] rounded-lg hover:bg-blue-50 transition-colors"
        >
          {course.status === 'Planned' ? 'Add Content' : 'Edit'}
        </Link>
        {course.status === 'Complete' && (
          <DownloadButton courseId={course.id} courseNumber={course.course_number} />
        )}
      </div>
    </div>
  )
}
