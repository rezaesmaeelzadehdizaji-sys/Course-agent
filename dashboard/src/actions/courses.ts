'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CourseMeta, CourseStatus } from '@/lib/types'

export async function updateCourseMeta(
  courseId: string,
  meta: CourseMeta,
  status: CourseStatus,
  progressPct: number
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('courses')
    .update({ meta, status, progress_pct: progressPct })
    .eq('id', courseId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/courses/${courseId}`)
  revalidatePath('/dashboard')
}
