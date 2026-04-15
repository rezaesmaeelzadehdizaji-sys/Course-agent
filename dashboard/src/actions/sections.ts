'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SectionSubsections, IntroSubsection, JournalEntry, Reference } from '@/lib/types'

export async function updateSection(sectionId: string, subsections: SectionSubsections) {
  const supabase = await createClient()

  const { data: section, error: fetchError } = await supabase
    .from('sections')
    .select('course_id')
    .eq('id', sectionId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const { error } = await supabase
    .from('sections')
    .update({ subsections })
    .eq('id', sectionId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/courses/${section.course_id}`)
}

export async function updateIntroduction(
  introId: string,
  data: { title: string; paragraphs: string[]; subsections: IntroSubsection[] }
) {
  const supabase = await createClient()

  const { data: intro, error: fetchError } = await supabase
    .from('introductions')
    .select('course_id')
    .eq('id', introId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const { error } = await supabase
    .from('introductions')
    .update(data)
    .eq('id', introId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/courses/${intro.course_id}`)
}

export async function updateJournalSection(
  journalId: string,
  data: { title: string; intro: string; journals: JournalEntry[]; institutional_resources: string[] }
) {
  const supabase = await createClient()

  const { data: journal, error: fetchError } = await supabase
    .from('journal_sections')
    .select('course_id')
    .eq('id', journalId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const { error } = await supabase
    .from('journal_sections')
    .update(data)
    .eq('id', journalId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/courses/${journal.course_id}`)
}

export async function upsertReference(courseId: string, ref: Reference) {
  const supabase = await createClient()

  // For new refs (temp id starts with 'new-'), insert; otherwise update
  if (ref.id.startsWith('new-')) {
    const { error } = await supabase.from('references').insert({
      course_id: courseId,
      ref_key: ref.ref_key,
      apa: ref.apa,
      short: ref.short,
      sort_order: ref.sort_order,
    })
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('references')
      .update({ ref_key: ref.ref_key, apa: ref.apa, short: ref.short, sort_order: ref.sort_order })
      .eq('id', ref.id)
    if (error) throw new Error(error.message)
  }

  revalidatePath(`/dashboard/courses/${courseId}`)
}

export async function deleteReference(refId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('references').delete().eq('id', refId)
  if (error) throw new Error(error.message)
}
