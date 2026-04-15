'use client'

import { useState } from 'react'
import { updateCourseMeta } from '@/actions/courses'
import type { Course, CourseMeta } from '@/lib/types'

interface Props {
  course: Course
}

export default function MetaEditor({ course }: Props) {
  const [meta, setMeta] = useState<CourseMeta>({
    title: course.meta?.title ?? '',
    subtitle: course.meta?.subtitle ?? '',
    organization: course.meta?.organization ?? '',
    date: course.meta?.date ?? '',
    version: course.meta?.version ?? '',
    disclaimer: course.meta?.disclaimer ?? '',
  })
  const [status, setStatus] = useState(course.status)
  const [progressPct, setProgressPct] = useState(course.progress_pct)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleChange(field: keyof CourseMeta, value: string) {
    setMeta(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')

    try {
      await updateCourseMeta(course.id, meta, status as Course['status'], progressPct)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const fields: Array<{ key: keyof CourseMeta; label: string; multiline?: boolean }> = [
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'organization', label: 'Organization' },
    { key: 'date', label: 'Date' },
    { key: 'version', label: 'Version' },
    { key: 'disclaimer', label: 'Disclaimer', multiline: true },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, multiline }) => (
          <div key={key} className={multiline ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            {multiline ? (
              <textarea
                value={meta[key]}
                onChange={e => handleChange(key, e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5] resize-none"
              />
            ) : (
              <input
                type="text"
                value={meta[key]}
                onChange={e => handleChange(key, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5]"
              />
            )}
          </div>
        ))}

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Course['status'])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5]"
          >
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Complete">Complete</option>
          </select>
        </div>

        {/* Progress */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Progress: {progressPct}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={progressPct}
            onChange={e => setProgressPct(Number(e.target.value))}
            className="w-full accent-[#2E74B5]"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-medium text-white bg-[#1F3864] hover:bg-[#2E74B5] py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Saved!</span>
        )}
      </div>
    </div>
  )
}
