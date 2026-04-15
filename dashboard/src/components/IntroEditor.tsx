'use client'

import { useState } from 'react'
import type { Introduction, IntroSubsection } from '@/lib/types'
import ParagraphEditor from './ParagraphEditor'
import { updateIntroduction } from '@/actions/sections'

interface Props {
  intro: Introduction
}

export default function IntroEditor({ intro }: Props) {
  const [title, setTitle] = useState(intro.title)
  const [paragraphs, setParagraphs] = useState(intro.paragraphs)
  const [subsections, setSubsections] = useState<IntroSubsection[]>(intro.subsections)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleSubsectionChange(index: number, field: keyof IntroSubsection, value: string | string[]) {
    const updated = [...subsections]
    updated[index] = { ...updated[index], [field]: value }
    setSubsections(updated)
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await updateIntroduction(intro.id, { title, paragraphs, subsections })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <label className="block text-xs font-medium text-gray-600 mb-1">Section Title</label>
        <input
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); setSaved(false) }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5]"
        />
      </div>

      {/* Main paragraphs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-xs font-semibold text-[#2E74B5] uppercase tracking-wide mb-3">
          Main Paragraphs
        </h3>
        <ParagraphEditor paragraphs={paragraphs} onChange={p => { setParagraphs(p); setSaved(false) }} />
      </div>

      {/* Subsections */}
      {subsections.map((sub, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Subsection {i + 1} Heading
            </label>
            <input
              type="text"
              value={sub.heading}
              onChange={e => handleSubsectionChange(i, 'heading', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Paragraphs</label>
            <ParagraphEditor
              paragraphs={sub.paragraphs}
              onChange={p => handleSubsectionChange(i, 'paragraphs', p)}
            />
          </div>
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-medium text-white bg-[#1F3864] hover:bg-[#2E74B5] py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Introduction'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
      </div>
    </div>
  )
}
