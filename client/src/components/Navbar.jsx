import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, Code2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import GlassButton from './ui/GlassButton'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/#about' },
  { label: 'Skills', to: '/#skills' },
  { label: 'Experience', to: '/#experience' },
  { label: 'Projects', to: '/projects' },
  { label: 'Freelance', to: '/freelance' },
  { label: 'Contact', to: '/#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const handleHashLink = (e, to) => {
    if (to.startsWith('/#')) {
      e.preventDefault()
      const id = to.replace('/#', '')
      if (location.pathname !== '/') {
        window.location.href = to
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <motion.nav
        initial={{y: -100, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        transition={{duration: 0.6, ease: 'easeOut'}}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 ${
            scrolled
              ? 'backdrop-blur-xl bg-gray-900/80 dark:bg-gray-900/80 bg-white/80 border border-white/10 shadow-glass'
              : 'backdrop-blur-sm bg-transparent'
          }`}>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-glow">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-white dark:text-white text-gray-900 text-lg hidden sm:block">
                Sagar<span className="gradient-text">.</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleHashLink(e, link.to)}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive && !link.to.includes('#')
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link to="/freelance" className="hidden sm:block">
                <GlassButton size="sm" variant="primary">Hire Me</GlassButton>
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{opacity: 0, x: '100%'}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: '100%'}}
            transition={{type: 'spring', damping: 25, stiffness: 250}}
            className="fixed inset-y-0 right-0 z-40 w-72 backdrop-blur-xl bg-gray-900/95 border-l border-white/10 shadow-glass lg:hidden flex flex-col pt-20 pb-8 px-6"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleHashLink(e, link.to)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive && !link.to.includes('#')
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-6">
              <Link to="/freelance">
                <GlassButton className="w-full" variant="primary">Hire Me for Freelance</GlassButton>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}
