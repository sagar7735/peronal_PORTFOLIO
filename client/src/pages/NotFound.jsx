import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import { scaleIn } from '../utils/animations'

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 — Page Not Found | Sagar Kumar Jena</title></Helmet>
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div variants={scaleIn} initial="hidden" animate="visible" className="max-w-lg w-full text-center">
          <GlassCard glow className="p-12 space-y-6">
            {/* Animated 404 */}
            <motion.div
              animate={{y: [0, -10, 0]}}
              transition={{duration: 3, repeat: Infinity, ease: 'easeInOut'}}
            >
              <h1 className="font-heading text-8xl sm:text-9xl font-bold gradient-text">404</h1>
            </motion.div>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-bold text-white">Page Not Found</h2>
              <p className="text-gray-400">Oops! The page you're looking for doesn't exist or has been moved.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link to="/">
                <GlassButton variant="primary" size="lg">
                  <Home className="w-4 h-4" /> Go Home
                </GlassButton>
              </Link>
              <button onClick={() => window.history.back()}>
                <GlassButton variant="secondary" size="lg">
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </GlassButton>
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </>
  )
}
