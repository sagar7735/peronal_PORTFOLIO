import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

const GlassSelect = forwardRef(function GlassSelect(
  { label, error, className = '', id, children, ...props },
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
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-2.5 pr-10 rounded-xl text-sm appearance-none',
            'bg-white/5 border border-white/10',
            'text-white',
            'backdrop-blur-md',
            'focus:outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20',
            'transition-all duration-200',
            error && 'border-red-500/60',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})

export default GlassSelect
