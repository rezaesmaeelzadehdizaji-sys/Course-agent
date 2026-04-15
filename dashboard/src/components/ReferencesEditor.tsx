'use client'

import { useState } from 'react'
import type { Reference } from '@/lib/types'
import { upsertReference, deleteReference } from '@/actions/sections'

interface Props {
  references: Reference[]
  courseId: string
}

export default function ReferencesEditor({ references: initial, courseId }: Props) {
  const [refs, setRefs] = useState(initial)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleSave(ref: Reference) {
    setSaving(ref.id)
    setError('')
    try {
      await upsertReference(courseId, ref)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  async function handleDelete(ref: Reference) {
    if (!confirm(`Delete reference "${ref.ref_key}"?`)) return
    setSaving(ref.id)
    try {
      await deleteReference(ref.id)
      setRefs(refs.filter(r => r.id !== ref.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setSaving(null)
    }
  }

  function handleChange(id: string, field: keyof Reference, value: string | number) {
    setRefs(refs.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

      {refs.map((ref) => (
        <div key={ref.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Key</label>
              <input type="text" value={ref.ref_key}
                onChange={e => handleChange(ref.id, 'ref_key', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Short citation</label>
              <input type="text" value={ref.short}
                onChange={e => handleChange(ref.id, 'short', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5]" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">APA Citation</label>
              <textarea value={ref.apa}
                onChange={e => handleChange(ref.id, 'apa', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5] resize-none" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button onClick={() => handleSave(ref)} disabled={saving === ref.id}
              className="text-xs font-medium text-white bg-[#1F3864] hover:bg-[#2E74B5] py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50">
              {saving === ref.id ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => handleDelete(ref)} disabled={saving === ref.id}
              className="text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50">
              Delete
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => {
          const newRef: Reference = {
            id: `new-${Date.now()}`,
            course_id: courseId,
            ref_key: '',
            apa: '',
            short: '',
            sort_order: refs.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setRefs([...refs, newRef])
        }}
        className="text-sm text-[#2E74B5] hover:text-[#1F3864] font-medium flex items-center gap-1.5 transition-colors"
      >
        + Add Reference
      </button>
    </div>
  )
}
