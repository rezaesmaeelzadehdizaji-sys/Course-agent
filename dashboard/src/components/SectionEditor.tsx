'use client'

import { useState } from 'react'
import type { Section, SectionSubsections, SubsectionData } from '@/lib/types'
import ParagraphEditor from './ParagraphEditor'
import { updateSection } from '@/actions/sections'

interface Props {
  section: Section
  courseId: string
}

const SUBSECTION_LABELS: Array<{ key: keyof SectionSubsections; label: string }> = [
  { key: 'whatItIs',            label: 'What It Is' },
  { key: 'whyItMatters',        label: 'Why It Matters' },
  { key: 'howToAssess',         label: 'How to Assess' },
  { key: 'abnormalFindings',    label: 'What Abnormal Findings Indicate' },
  { key: 'managementResponses', label: 'Recommended Management Responses' },
]

export default function SectionEditor({ section, courseId }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [subsections, setSubsections] = useState<SectionSubsections>(section.subsections)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleParagraphsChange(key: keyof SectionSubsections, paragraphs: string[]) {
    setSubsections(prev => ({
      ...prev,
      [key]: { ...prev[key], paragraphs },
    }))
    setSaved(false)
  }

  function handleHeadingChange(key: keyof SectionSubsections, heading: string) {
    setSubsections(prev => ({
      ...prev,
      [key]: { ...prev[key], heading },
    }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await updateSection(section.id, subsections)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Section header — click to expand */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#1F3864] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
            {section.letter}
          </span>
          <div>
            <p className="text-sm font-semibold text-[#1F3864]">{section.full_title}</p>
            <p className="text-xs text-gray-400">
              {SUBSECTION_LABELS.length} subsections
            </p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-6">
          {SUBSECTION_LABELS.map(({ key, label }) => {
            const sub = subsections[key] as SubsectionData
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-[#2E74B5] uppercase tracking-wide">
                    {label}
                  </h4>
                </div>

                {/* Heading */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Heading</label>
                  <input
                    type="text"
                    value={sub?.heading ?? label}
                    onChange={e => handleHeadingChange(key, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5]"
                  />
                </div>

                {/* Paragraphs */}
                <ParagraphEditor
                  paragraphs={sub?.paragraphs ?? []}
                  onChange={paras => handleParagraphsChange(key, paras)}
                />

                {/* Image placeholder for managementResponses */}
                {key === 'managementResponses' && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 text-xs text-gray-500">
                    <p className="font-medium mb-1">Image Placeholder</p>
                    <p className="text-gray-400">
                      Caption: {(sub as any)?.imagePlaceholder?.caption || '(none)'}
                    </p>
                  </div>
                )}
              </div>
            )
          })}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm font-medium text-white bg-[#1F3864] hover:bg-[#2E74B5] py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save Section'}
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          </div>
        </div>
      )}
    </div>
  )
}
