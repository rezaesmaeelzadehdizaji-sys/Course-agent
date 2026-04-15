export type CourseStatus = 'Complete' | 'In Progress' | 'Planned'

export interface CourseMeta {
  title: string
  subtitle: string
  organization: string
  date: string
  version: string
  disclaimer: string
}

export interface Course {
  id: string
  course_number: number
  slug: string
  status: CourseStatus
  progress_pct: number
  meta: CourseMeta
  created_at: string
  updated_at: string
}

export interface SubsectionData {
  heading: string
  paragraphs: string[]
  imagePlaceholder?: { caption: string; description: string }
}

export interface SectionSubsections {
  whatItIs: SubsectionData
  whyItMatters: SubsectionData
  howToAssess: SubsectionData
  abnormalFindings: SubsectionData
  managementResponses: SubsectionData & { imagePlaceholder: { caption: string; description: string } }
}

export interface Section {
  id: string
  course_id: string
  section_key: string
  letter: string
  title: string
  full_title: string
  sort_order: number
  subsections: SectionSubsections
  created_at: string
  updated_at: string
}

export interface IntroSubsection {
  heading: string
  paragraphs: string[]
}

export interface Introduction {
  id: string
  course_id: string
  title: string
  paragraphs: string[]
  subsections: IntroSubsection[]
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  name: string
  publisher: string
  scope: string
  issn: string
}

export interface JournalSection {
  id: string
  course_id: string
  title: string
  intro: string
  journals: JournalEntry[]
  institutional_resources: string[]
  created_at: string
  updated_at: string
}

export interface Reference {
  id: string
  course_id: string
  ref_key: string
  apa: string
  short: string
  sort_order: number
  created_at: string
  updated_at: string
}

// Shape expected by doc-generator (mirrors original course-content.js)
export interface DocCourseContent {
  meta: CourseMeta & { courseNumber: string }
  introduction: {
    title: string
    paragraphs: string[]
    subsections: IntroSubsection[]
  }
  sections: Array<{
    id: string
    letter: string
    title: string
    fullTitle: string
    subsections: SectionSubsections
  }>
  journalSection: {
    title: string
    intro: string
    journals: JournalEntry[]
    institutionalResources: string[]
  }
}

export interface DocReferences {
  referenceEntries: Record<string, { apa: string; short: string }>
  bibliographyOrder: string[]
}
