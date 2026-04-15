'use client'

import { useState } from 'react'
import type { JournalSection, JournalEntry } from '@/lib/types'
import { updateJournalSection } from '@/actions/sections'

interface Props {
  journal: JournalSection
}

export default function JournalEditor({ journal }: Props) {
  const [title, setTitle] = useState(journal.title)
  const [intro, setIntro] = useState(journal.intro)
  const [journals, setJournals] = useState<JournalEntry[]>(journal.journals)
  const [resources, setResources] = useState<string[]>(journal.institutional_resources)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleJournalChange(i: number, field: keyof JournalEntry, value: string) {
    const updated = [...journals]
    updated[i] = { ...updated[i], [field]: value }
    setJournals(updated)
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await updateJournalSection(journal.id, { title, intro, journals, institutional_resources: resources })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Section Title</label>
          <input type="text" value={title} onChange={e => { setTitle(e.target.value); setSaved(false) }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Intro paragraph</label>
          <textarea value={intro} onChange={e => { setIntro(e.target.value); setSaved(false) }} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5] resize-none" />
        </div>
      </div>

      <h3 className="text-sm font-semibold text-[#1F3864]">Peer-Reviewed Journals</h3>
      {journals.map((j, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 grid grid-cols-2 gap-3">
          {(['name', 'publisher', 'scope', 'issn'] as const).map(field => (
            <div key={field} className={field === 'scope' ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field}</label>
              <input type="text" value={j[field]} onChange={e => handleJournalChange(i, field, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5]" />
            </div>
          ))}
        </div>
      ))}

      <div>
        <h3 className="text-sm font-semibold text-[#1F3864] mb-3">Institutional Resources</h3>
        {resources.map((r, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="text" value={r} onChange={e => { const u = [...resources]; u[i] = e.target.value; setResources(u); setSaved(false) }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5]" />
            <button onClick={() => { setResources(resources.filter((_, idx) => idx !== i)); setSaved(false) }}
              className="text-red-400 hover:text-red-600 text-sm">✕</button>
          </div>
        ))}
        <button onClick={() => { setResources([...resources, '']); setSaved(false) }}
          className="text-xs text-[#2E74B5] hover:text-[#1F3864] font-medium">+ Add resource</button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving}
          className="text-sm font-medium text-white bg-[#1F3864] hover:bg-[#2E74B5] py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Journals'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
      </div>
    </div>
  )
}
