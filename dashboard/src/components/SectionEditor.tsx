'use client'

import { useState } from 'react'
import type { Section, SubsectionData } from '@/lib/types'
import ParagraphEditor from './ParagraphEditor'
import { updateSection } from '@/actions/sections'

interface Props {
  section: Section
  courseId: string
}

export default function SectionEditor({ section, courseId }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [subsections, setSubsections] = useState<SubsectionData[]>(
    Array.isArray(section.subsections) ? section.subsections : [],
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Badge: use the acronym letter if present (T-FLAWS), else the section's ordinal.
  const badge = section.letter && section.letter.trim() ? section.letter.trim() : String(section.sort_order)

  function handleParagraphsChange(idx: number, paragraphs: string[]) {
    setSubsections(prev => prev.map((s, i) => (i === idx ? { ...s, paragraphs } : s)))
    setSaved(false)
  }

  function handleHeadingChange(idx: number, heading: string) {
    setSubsections(prev => prev.map((s, i) => (i === idx ? { ...s, heading } : s)))
    setSaved(false)
  }

  function addSubsection() {
    setSubsections(prev => [...prev, { heading: '', paragraphs: [] }])
    setSaved(false)
  }

  function removeSubsection(idx: number) {
    setSubsections(prev => prev.filter((_, i) => i !== idx))
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
            {badge}
          </span>
          <div>
            <p className="text-sm font-semibold text-[#1F3864]">{section.full_title || section.title}</p>
            <p className="text-xs text-gray-400">
              {subsections.length} {subsections.length === 1 ? 'subsection' : 'subsections'}
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
          {subsections.length === 0 && (
            <p className="text-sm text-gray-400">No subsections yet.</p>
          )}
          {subsections.map((sub, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-[#2E74B5] uppercase tracking-wide">
                  Subsection {idx + 1}
                </h4>
                <button
                  onClick={() => removeSubsection(idx)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              {/* Heading */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Heading</label>
                <input
                  type="text"
                  value={sub?.heading ?? ''}
                  onChange={e => handleHeadingChange(idx, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5]"
                />
              </div>

              {/* Paragraphs */}
              <ParagraphEditor
                paragraphs={sub?.paragraphs ?? []}
                onChange={paras => handleParagraphsChange(idx, paras)}
              />

              {/* Optional image placeholder */}
              {sub?.imagePlaceholder && (
                <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 text-xs text-gray-500">
                  <p className="font-medium mb-1">Image Placeholder</p>
                  <p className="text-gray-400">Caption: {sub.imagePlaceholder.caption || '(none)'}</p>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addSubsection}
            className="text-sm text-[#2E74B5] hover:underline"
          >
            + Add subsection
          </button>

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
