import { useCallback, useState } from 'react'
import { Upload, X, FileText, Image } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function FileDropzone({
  label,
  accept,
  multiple = false,
  maxSizeMB = 5,
  value,
  onChange,
  error,
  className = '',
}) {
  const [dragging, setDragging] = useState(false)

  const validate = (file) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large (max ${maxSizeMB}MB)`
    }
    return null
  }

  const handleFiles = useCallback(
    (files) => {
      const valid = Array.from(files).filter((f) => !validate(f))
      if (multiple) {
        onChange(valid)
      } else {
        onChange(valid[0] || null)
      }
    },
    [multiple, onChange]
  )

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const files = value ? (Array.isArray(value) ? value : [value]) : []

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer',
          dragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-white/20 bg-white/5 hover:border-purple-500/60 hover:bg-white/8',
          error && 'border-red-500/60',
          className
        )}
        onClick={() => document.getElementById('file-input-' + label)?.click()}
      >
        <input
          id={'file-input-' + label}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
        <p className="text-sm text-gray-400">
          Drag & drop or <span className="text-purple-400">browse</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">Max {maxSizeMB}MB</p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-1.5 mt-1">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300"
            >
              {file.type?.startsWith('image') ? (
                <Image className="w-4 h-4 text-cyan-400" />
              ) : (
                <FileText className="w-4 h-4 text-purple-400" />
              )}
              <span className="flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (multiple) {
                    onChange(files.filter((_, j) => j !== i))
                  } else {
                    onChange(null)
                  }
                }}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
