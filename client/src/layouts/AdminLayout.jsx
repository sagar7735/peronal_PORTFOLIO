import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, User, Code2, Briefcase, FolderOpen, Settings,
  MessageSquare, Star, LogOut, Bell, Menu, X, ChevronLeft,
  ChevronRight, ExternalLink, Lock, Globe
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { adminAnalyticsApi } from '../services/adminApi'
import { cn } from '../utils/cn'
import GlassCard from '../components/ui/GlassCard'
import AnimatedBackground from '../components/ui/AnimatedBackground'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/profile', icon: User, label: 'Profile' },
  { to: '/admin/skills', icon: Code2, label: 'Skills' },
  { to: '/admin/experience', icon: Briefcase, label: 'Experience' },
  { to: '/admin/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/admin/services', icon: Settings, label: 'Services' },
  { to: '/admin/freelance', icon: Globe, label: 'Applications' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/admin/testimonials', icon: Star, label: 'Testimonials' },
  { to: '/admin/change-password', icon: Lock, label: 'Password' },
]

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState({ apps: 0, messages: 0 })

  // Fetch notification counts
  useEffect(() => {
    adminAnalyticsApi.getDashboardStats()
      .then(res => {
        const stats = res.data?.data?.stats
        if (stats) {
          setNotifications({
            apps: stats.newApplications || 0,
            messages: stats.unreadMessages || 0,
          })
        }
      })
      .catch(() => {})
  }, [])

  const totalNotifications = notifications.apps + notifications.messages

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/10', collapsed && !isMobile && 'justify-center px-2')}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-glow">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <span className="font-heading font-bold text-white text-sm">Admin Panel</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
              isActive
                ? 'bg-gradient-to-r from-purple-600/40 to-blue-600/40 text-white border border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5',
              collapsed && !isMobile && 'justify-center px-2'
            )}>
            <Icon className="w-4.5 h-4.5 shrink-0" style={{width: 18, height: 18}} />
            {(!collapsed || isMobile) && <span>{label}</span>}
            {/* Badge for freelance/messages */}
            {(!collapsed || isMobile) && to === '/admin/freelance' && notifications.apps > 0 && (
              <span className="ml-auto text-xs bg-purple-600 text-white rounded-full px-2 py-0.5 min-w-[20px] text-center">{notifications.apps}</span>
            )}
            {(!collapsed || isMobile) && to === '/admin/messages' && notifications.messages > 0 && (
              <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-2 py-0.5 min-w-[20px] text-center">{notifications.messages}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: View site + logout */}
      <div className={cn('border-t border-white/10 p-3 space-y-1', collapsed && !isMobile && 'px-2')}>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all',
            collapsed && !isMobile && 'justify-center px-2'
          )}>
          <ExternalLink className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span>View Live Site</span>}
        </a>
        <button onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all',
            collapsed && !isMobile && 'justify-center px-2'
          )}>
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex">
      <AnimatedBackground />

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{width: collapsed ? 64 : 240}}
        transition={{duration: 0.2, ease: 'easeInOut'}}
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 backdrop-blur-xl bg-gray-900/80 border-r border-white/10 shadow-glass overflow-hidden"
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-gray-800 border border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-glass z-50"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{x: '-100%'}} animate={{x: 0}} exit={{x: '-100%'}}
              transition={{type: 'spring', damping: 25, stiffness: 250}}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 backdrop-blur-xl bg-gray-900/95 border-r border-white/10 shadow-glass lg:hidden"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={cn('flex-1 flex flex-col min-h-screen transition-all duration-200', collapsed ? 'lg:ml-16' : 'lg:ml-60')}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-gray-900/70 border-b border-white/10 px-4 sm:px-6 py-3 flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Notification bell */}
          <Link to="/admin/freelance" className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalNotifications > 9 ? '9+' : totalNotifications}
              </span>
            )}
          </Link>

          {/* Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{admin?.name || 'Admin'}</p>
              <p className="text-gray-500 text-xs">{admin?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {admin?.name?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
