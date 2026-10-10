import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export default function GlassCard({
  children,
  className = '',
  hover = false,
  glow = false,
  onClick,
  as: Tag = 'div',
  ...props
}) {
  const base =
    'rounded-2xl border border-white/10 shadow-glass backdrop-blur-xl ' +
    'bg-white/5 dark:bg-white/5 bg-white/40 ' +
    'transition-all duration-300'
  const hoverClass = hover
    ? 'hover:-translate-y-1 hover:shadow-glow hover:border-white/20 cursor-pointer'
    : ''
  const glowClass = glow ? 'shadow-glow border-purple-500/30' : ''

  if (onClick || hover) {
    return (
      <motion.div
        className={cn(base, hoverClass, glowClass, className)}
        onClick={onClick}
        whileHover={hover ? { y: -4 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <Tag className={cn(base, glowClass, className)} {...props}>
      {children}
    </Tag>
  )
}
