import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../utils/animations'

export default function SectionTitle({ tag, title, subtitle, className = '', light = false }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={`text-center space-y-3 ${className}`}
    >
      {tag && (
        <motion.span
          variants={fadeUp}
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-purple-600/20 border border-purple-500/30 text-purple-400"
        >
          {tag}
        </motion.span>
      )}
      <motion.h2
        variants={fadeUp}
        className={`font-heading text-3xl md:text-4xl lg:text-5xl font-bold ${
          light ? 'text-gray-900' : 'text-white'
        }`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          className={`text-base md:text-lg max-w-2xl mx-auto ${
            light ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}
