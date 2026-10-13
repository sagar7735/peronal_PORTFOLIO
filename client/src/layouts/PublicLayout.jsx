import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { analyticsApi } from '../services/publicApi'

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{opacity: 0, y: 8}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -8}}
      transition={{duration: 0.25, ease: 'easeInOut'}}
    >
      {children}
    </motion.div>
  )
}

export default function PublicLayout() {
  const location = useLocation()

  useEffect(() => {
    analyticsApi.track(location.pathname).catch(() => {})
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
