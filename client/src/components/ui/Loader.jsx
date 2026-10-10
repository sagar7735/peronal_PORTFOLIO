import { motion } from 'framer-motion'

export default function Loader({ size = 'md', text = '' }) {
  const sizeMap = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' }
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${sizeMap[size]} rounded-full border-2 border-transparent border-t-purple-500 border-r-cyan-500`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p className="text-sm text-gray-400 animate-pulse">{text}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" text="Loading..." />
    </div>
  )
}
