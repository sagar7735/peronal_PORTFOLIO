import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function TagsInput({
  label,
  value = [],
  onChange,
  placeholder = 'Add tag and press Enter',
  error,
  className = '',
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const addTag = (tag) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
  }

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <div
        className={cn(
          'min-h-[44px] flex flex-wrap gap-2 px-3 py-2 rounded-xl',
          'bg-white/5 border border-white/10 backdrop-blur-md',
          'focus-within:border-purple-500/70 focus-within:ring-2 focus-within:ring-purple-500/20',
          'transition-all duration-200 cursor-text',
          error && 'border-red-500/60',
          className
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-600/30 border border-purple-500/40 text-purple-300"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              className="hover:text-white transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-white placeholder-gray-500"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
