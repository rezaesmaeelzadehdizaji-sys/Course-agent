import CourseCard from './CourseCard'
import type { Course } from '@/lib/types'

interface Props {
  courses: Course[]
}

// Titles for courses that haven't been created yet in the DB
const PLANNED_TITLES: Record<number, string> = {
  1: 'T-FLAWS – Assessment Management Tool',
  2: 'Biosecurity Fundamentals',
  3: 'Vaccination Programs',
  4: 'Nutrition & Feed Management',
  5: 'Water Quality & Management',
  6: 'Ventilation & Environmental Control',
  7: 'Litter Management',
  8: 'Flock Health Monitoring',
  9: 'Disease Recognition & Response',
  10: 'Medication & Treatment Records',
  11: 'Mortality Management',
  12: 'Catching & Loading Best Practices',
  13: 'Record Keeping & Traceability',
  14: 'On-Farm Animal Welfare Audits',
  15: 'Emergency Preparedness',
  16: 'Predator & Pest Management',
  17: 'End-of-Flock Assessment',
}

export default function CourseGrid({ courses }: Props) {
  // Build a map for quick lookup by course_number
  const courseMap = new Map(courses.map(c => [c.course_number, c]))

  // Render all 17 slots
  const cards = Array.from({ length: 17 }, (_, i) => {
    const num = i + 1
    const course = courseMap.get(num)

    if (course) return <CourseCard key={num} course={course} />

    // Placeholder card for courses not yet in DB
    return (
      <div
        key={num}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 opacity-60"
      >
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
            Course {num}
          </span>
          <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">
            Planned
          </span>
        </div>
        <h3 className="text-sm font-semibold text-gray-500 leading-snug">
          {PLANNED_TITLES[num] ?? `Course ${num}`}
        </h3>
        <div className="mt-auto">
          <div className="h-1.5 bg-gray-100 rounded-full w-full" />
          <p className="text-xs text-gray-400 mt-1">0% complete</p>
        </div>
      </div>
    )
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards}
    </div>
  )
}
