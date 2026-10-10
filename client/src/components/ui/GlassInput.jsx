import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const GlassInput = forwardRef(function GlassInput(
  { label, error, className = '', id, ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 rounded-xl text-sm',
          'bg-white/5 border border-white/10',
          'text-white placeholder-gray-500',
          'backdrop-blur-md',
          'focus:outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20',
          'transition-all duration-200',
          error && 'border-red-500/60 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})

export default GlassInput
