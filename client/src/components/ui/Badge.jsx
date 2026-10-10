import { cn } from '../../utils/cn'

const colorMap = {
  purple: 'bg-purple-600/20 border-purple-500/30 text-purple-300',
  blue: 'bg-blue-600/20 border-blue-500/30 text-blue-300',
  cyan: 'bg-cyan-600/20 border-cyan-500/30 text-cyan-300',
  green: 'bg-green-600/20 border-green-500/30 text-green-300',
  red: 'bg-red-600/20 border-red-500/30 text-red-300',
  yellow: 'bg-yellow-600/20 border-yellow-500/30 text-yellow-300',
  pink: 'bg-pink-600/20 border-pink-500/30 text-pink-300',
  gray: 'bg-gray-600/20 border-gray-500/30 text-gray-300',
}

export default function Badge({ children, color = 'purple', className = '', dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        colorMap[color] || colorMap.gray,
        className
      )}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse-slow bg-current`} />
      )}
      {children}
    </span>
  )
}
