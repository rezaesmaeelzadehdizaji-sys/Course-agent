'use client'

interface Props {
  paragraphs: string[]
  onChange: (paragraphs: string[]) => void
}

export default function ParagraphEditor({ paragraphs, onChange }: Props) {
  function handleChange(index: number, value: string) {
    const updated = [...paragraphs]
    updated[index] = value
    onChange(updated)
  }

  function handleAdd() {
    onChange([...paragraphs, ''])
  }

  function handleDelete(index: number) {
    onChange(paragraphs.filter((_, i) => i !== index))
  }

  function handleMove(index: number, direction: 'up' | 'down') {
    const updated = [...paragraphs]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= updated.length) return
    ;[updated[index], updated[target]] = [updated[target], updated[index]]
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      {paragraphs.map((para, i) => (
        <div key={i} className="flex gap-2 items-start group">
          {/* Move buttons */}
          <div className="flex flex-col gap-0.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleMove(i, 'up')}
              disabled={i === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
              title="Move up"
            >
              ▲
            </button>
            <button
              onClick={() => handleMove(i, 'down')}
              disabled={i === paragraphs.length - 1}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
              title="Move down"
            >
              ▼
            </button>
          </div>

          <textarea
            value={para}
            onChange={e => handleChange(i, e.target.value)}
            rows={3}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E74B5] resize-y"
            placeholder={`Paragraph ${i + 1}`}
          />

          <button
            onClick={() => handleDelete(i)}
            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity mt-2"
            title="Delete paragraph"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="text-xs text-[#2E74B5] hover:text-[#1F3864] font-medium flex items-center gap-1 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add paragraph
      </button>
    </div>
  )
}
