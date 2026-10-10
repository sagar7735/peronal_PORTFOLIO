import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white shadow-glow ' +
    'hover:shadow-glow hover:opacity-90 border-transparent',
  secondary:
    'backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20',
  outline:
    'border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent',
  danger:
    'bg-red-600/80 border border-red-500/50 text-white hover:bg-red-600',
  ghost:
    'bg-transparent border-transparent text-gray-300 hover:bg-white/10',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
}

export default function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium border transition-all duration-200',
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  )
}
