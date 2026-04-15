import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Section, Introduction, JournalSection, Reference } from '@/lib/types'
import SectionEditor from '@/components/SectionEditor'
import IntroEditor from '@/components/IntroEditor'
import JournalEditor from '@/components/JournalEditor'
import ReferencesEditor from '@/components/ReferencesEditor'

interface Props {
  params: Promise<{ courseId: string; sectionId: string }>
}

export default async function SectionPage({ params }: Props) {
  const { courseId, sectionId } = await params
  const supabase = await createClient()

  // Handle special section types
  if (sectionId === 'introduction') {
    const introRes = await supabase
      .from('introductions')
      .select('*')
      .eq('course_id', courseId)
      .single()

    if (introRes.error || !introRes.data) notFound()
    const intro = introRes.data as Introduction

    return (
      <div className="max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 flex items-center gap-2 mb-6">
          <Link href="/dashboard" className="hover:text-[#2E74B5]">All Courses</Link>
          <span>/</span>
          <Link href={`/dashboard/courses/${courseId}`} className="hover:text-[#2E74B5]">Course</Link>
          <span>/</span>
          <span className="text-[#1F3864] font-medium">Introduction</span>
        </nav>
        <h1 className="text-xl font-bold text-[#1F3864] mb-6">Edit Introduction</h1>
        <IntroEditor intro={intro} />
      </div>
    )
  }

  if (sectionId === 'journals') {
    const journalRes = await supabase
      .from('journal_sections')
      .select('*')
      .eq('course_id', courseId)
      .single()

    if (journalRes.error || !journalRes.data) notFound()
    const journal = journalRes.data as JournalSection

    return (
      <div className="max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 flex items-center gap-2 mb-6">
          <Link href="/dashboard" className="hover:text-[#2E74B5]">All Courses</Link>
          <span>/</span>
          <Link href={`/dashboard/courses/${courseId}`} className="hover:text-[#2E74B5]">Course</Link>
          <span>/</span>
          <span className="text-[#1F3864] font-medium">Journals</span>
        </nav>
        <h1 className="text-xl font-bold text-[#1F3864] mb-6">Edit Journals & Resources</h1>
        <JournalEditor journal={journal} />
      </div>
    )
  }

  if (sectionId === 'references') {
    const refsRes = await supabase
      .from('references')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order')

    const refs = (refsRes.data ?? []) as Reference[]

    return (
      <div className="max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 flex items-center gap-2 mb-6">
          <Link href="/dashboard" className="hover:text-[#2E74B5]">All Courses</Link>
          <span>/</span>
          <Link href={`/dashboard/courses/${courseId}`} className="hover:text-[#2E74B5]">Course</Link>
          <span>/</span>
          <span className="text-[#1F3864] font-medium">References</span>
        </nav>
        <h1 className="text-xl font-bold text-[#1F3864] mb-6">Edit References</h1>
        <ReferencesEditor references={refs} courseId={courseId} />
      </div>
    )
  }

  // Regular T-FLAWS section by UUID
  const sectionRes = await supabase
    .from('sections')
    .select('*')
    .eq('id', sectionId)
    .single()

  if (sectionRes.error || !sectionRes.data) notFound()
  const section = sectionRes.data as Section

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="text-sm text-gray-500 flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="hover:text-[#2E74B5]">All Courses</Link>
        <span>/</span>
        <Link href={`/dashboard/courses/${courseId}`} className="hover:text-[#2E74B5]">Course</Link>
        <span>/</span>
        <span className="text-[#1F3864] font-medium">{section.full_title}</span>
      </nav>
      <h1 className="text-xl font-bold text-[#1F3864] mb-6">{section.full_title}</h1>
      <SectionEditor section={section} courseId={courseId} />
    </div>
  )
}
