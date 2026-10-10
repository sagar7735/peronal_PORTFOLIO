import { motion } from 'framer-motion'

const blobs = [
  {
    color: 'bg-purple-600',
    size: 'w-96 h-96',
    initial: { x: -100, y: -100 },
    animate: { x: [-100, 50, -80, -100], y: [-100, 80, -60, -100] },
    duration: 18,
  },
  {
    color: 'bg-blue-600',
    size: 'w-80 h-80',
    initial: { x: '60vw', y: '10vh' },
    animate: { x: ['60vw', '70vw', '55vw', '60vw'], y: ['10vh', '30vh', '5vh', '10vh'] },
    duration: 22,
  },
  {
    color: 'bg-cyan-500',
    size: 'w-72 h-72',
    initial: { x: '20vw', y: '60vh' },
    animate: { x: ['20vw', '35vw', '15vw', '20vw'], y: ['60vh', '50vh', '70vh', '60vh'] },
    duration: 25,
  },
  {
    color: 'bg-pink-600',
    size: 'w-64 h-64',
    initial: { x: '80vw', y: '70vh' },
    animate: { x: ['80vw', '75vw', '85vw', '80vw'], y: ['70vh', '80vh', '65vh', '70vh'] },
    duration: 20,
  },
  {
    color: 'bg-indigo-600',
    size: 'w-56 h-56',
    initial: { x: '45vw', y: '40vh' },
    animate: { x: ['45vw', '50vw', '40vw', '45vw'], y: ['40vh', '45vh', '35vh', '40vh'] },
    duration: 30,
  },
]

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Dark base */}
      <div className="absolute inset-0 bg-gray-950 dark:bg-gray-950 bg-gray-100" />

      {/* Animated blobs */}
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${blob.color} ${blob.size} opacity-20 dark:opacity-20 opacity-10 blur-3xl`}
          initial={blob.initial}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
