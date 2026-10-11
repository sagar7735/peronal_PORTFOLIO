import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FolderOpen, MessageSquare, Star, Users, TrendingUp,
  Eye, Clock, CheckCircle, XCircle, ArrowRight, ToggleLeft, ToggleRight
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { useApi } from '../../hooks/useApi'
import { adminAnalyticsApi, adminProfileApi } from '../../services/adminApi'
import { profileApi } from '../../services/publicApi'
import { fadeUp, scaleIn, stagger } from '../../utils/animations'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'
import api from '../../services/api'

const STATUS_COLORS = {
  new: '#7C3AED',
  reviewing: '#2563EB',
  accepted: '#10B981',
  'in-progress': '#06B6D4',
  completed: '#22C55E',
  rejected: '#EF4444',
}

const STATUS_BADGE_COLOR = {
  new: 'purple',
  reviewing: 'blue',
  accepted: 'green',
  'in-progress': 'cyan',
  completed: 'green',
  rejected: 'red',
}

function StatCard({ icon: Icon, label, value, color, loading, to }) {
  const colorMap = {
    purple: 'from-purple-600/30 to-purple-800/10 border-purple-500/20',
    blue: 'from-blue-600/30 to-blue-800/10 border-blue-500/20',
    cyan: 'from-cyan-600/30 to-cyan-800/10 border-cyan-500/20',
    green: 'from-green-600/30 to-green-800/10 border-green-500/20',
    red: 'from-red-600/30 to-red-800/10 border-red-500/20',
    yellow: 'from-yellow-600/30 to-yellow-800/10 border-yellow-500/20',
  }

  const iconColorMap = {
    purple: 'text-purple-400', blue: 'text-blue-400', cyan: 'text-cyan-400',
    green: 'text-green-400', red: 'text-red-400', yellow: 'text-yellow-400',
  }

  const card = (
    <GlassCard hover={!!to} className={cn('p-5 bg-gradient-to-br border', colorMap[color] || colorMap.purple)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="font-heading text-3xl font-bold text-white">{value ?? '\u2014'}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-white/5', iconColorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </GlassCard>
  )

  return to ? <Link to={to}>{card}</Link> : card
}

// Custom tooltip for line chart
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl bg-gray-900/90 border border-white/10 text-sm">
      <p className="text-gray-400">{label}</p>
      <p className="text-white font-bold">{payload[0].value} visitors</p>
    </div>
  )
}

export default function Dashboard() {
  const { data: statsData, loading, refetch } = useApi(adminAnalyticsApi.getDashboardStats)
  const { data: profile, refetch: refetchProfile } = useApi(profileApi.get)
  const [togglingAvailability, setTogglingAvailability] = useState(false)

  const stats = statsData?.stats || {}
  const visitors = statsData?.visitors || []
  const appsByStatus = statsData?.appsByStatus || []
  const recentApplications = statsData?.recentApplications || []
  const recentMessages = statsData?.recentMessages || []

  // Format visitors for chart
  const chartData = visitors.map(v => ({
    date: v._id ? new Date(v._id).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : v._id,
    visitors: v.count,
  }))

  // Donut chart data
  const donutData = appsByStatus.map(a => ({
    name: a._id,
    value: a.count,
    color: STATUS_COLORS[a._id] || '#6b7280',
  }))

  const toggleAvailability = async () => {
    if (!profile) return
    setTogglingAvailability(true)
    try {
      const fd = new FormData()
      fd.append('availableForFreelance', String(!profile.availableForFreelance))
      await adminProfileApi.update(fd)
      await refetchProfile()
      toast.success(`Freelance availability ${!profile.availableForFreelance ? 'enabled' : 'disabled'}`)
    } catch {
      toast.error('Failed to update availability')
    } finally {
      setTogglingAvailability(false)
    }
  }

  const statCards = [
    { icon: FolderOpen, label: 'Total Projects', value: stats.totalProjects, color: 'purple', to: '/admin/projects' },
    { icon: Users, label: 'New Applications', value: stats.newApplications, color: 'blue', to: '/admin/freelance' },
    { icon: MessageSquare, label: 'Unread Messages', value: stats.unreadMessages, color: 'cyan', to: '/admin/messages' },
    { icon: Star, label: 'Pending Reviews', value: stats.pendingTestimonials, color: 'yellow', to: '/admin/testimonials' },
    { icon: Eye, label: 'Total Visitors', value: stats.totalVisitors, color: 'green' },
    { icon: TrendingUp, label: 'Total Applications', value: stats.totalApplications, color: 'purple', to: '/admin/freelance' },
  ]

  return (
    <>
      <Helmet><title>Dashboard — Admin</title></Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
          </div>

          {/* Freelance availability toggle */}
          <GlassCard className="flex items-center gap-3 px-4 py-3">
            <span className="text-sm text-gray-300">Available for Freelance</span>
            <button
              onClick={toggleAvailability}
              disabled={togglingAvailability}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                profile?.availableForFreelance
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-red-500/20 border border-red-500/30 text-red-400',
                togglingAvailability && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Toggle freelance availability"
            >
              {profile?.availableForFreelance
                ? <><ToggleRight className="w-4 h-4" /> ON</>
                : <><ToggleLeft className="w-4 h-4" /> OFF</>
              }
            </button>
          </GlassCard>
        </div>

        {/* Stat cards */}
        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((card, i) => (
            <motion.div key={i} variants={scaleIn}>
              <StatCard {...card} loading={loading} />
            </motion.div>
          ))}
        </motion.div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line chart: 30-day visitors */}
          <motion.div className="lg:col-span-2" variants={fadeUp} initial="hidden" animate="visible">
            <GlassCard className="p-6">
              <h2 className="font-heading font-semibold text-white mb-4">Visitors (Last 30 Days)</h2>
              {loading ? (
                <Skeleton className="h-52 w-full rounded-xl" />
              ) : chartData.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-gray-500 text-sm">No visitor data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{top: 5, right: 10, left: -20, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{fill: '#6b7280', fontSize: 11}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{fill: '#6b7280', fontSize: 11}} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="visitors" stroke="#7C3AED" strokeWidth={2} dot={false} activeDot={{r: 4, fill: '#7C3AED'}} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          </motion.div>

          {/* Donut: apps by status */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <GlassCard className="p-6">
              <h2 className="font-heading font-semibold text-white mb-4">Applications by Status</h2>
              {loading ? (
                <Skeleton className="h-52 w-full rounded-xl" />
              ) : donutData.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-gray-500 text-sm">No applications yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{color: '#9ca3af', fontSize: 11}}>{value}</span>} />
                    <Tooltip formatter={(val, name) => [val, name]} contentStyle={{background: 'rgba(15,15,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12}} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Recent tables row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-semibold text-white">Recent Applications</h2>
                <Link to="/admin/freelance" className="text-purple-400 text-xs hover:text-purple-300 transition-colors flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
              ) : recentApplications.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map(app => (
                    <Link key={app._id} to="/admin/freelance"
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                      <div>
                        <p className="text-white text-sm font-medium group-hover:text-purple-400 transition-colors">{app.clientName}</p>
                        <p className="text-gray-500 text-xs">{app.projectType} · {new Date(app.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.isWaitlist && <Badge color="yellow">Waitlist</Badge>}
                        <Badge color={STATUS_BADGE_COLOR[app.status] || 'gray'}>{app.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Recent Messages */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-semibold text-white">Recent Messages</h2>
                <Link to="/admin/messages" className="text-purple-400 text-xs hover:text-purple-300 transition-colors flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
              ) : recentMessages.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No messages yet</p>
              ) : (
                <div className="space-y-3">
                  {recentMessages.map(msg => (
                    <Link key={msg._id} to="/admin/messages"
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group',
                        !msg.isRead && 'border-l-2 border-purple-500'
                      )}>
                      <div>
                        <p className={cn('text-sm font-medium group-hover:text-purple-400 transition-colors', !msg.isRead ? 'text-white' : 'text-gray-300')}>
                          {msg.name}
                        </p>
                        <p className="text-gray-500 text-xs truncate max-w-[200px]">{msg.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!msg.isRead && <Badge color="purple" dot>New</Badge>}
                        {msg.isReplied && <Badge color="green">Replied</Badge>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </>
  )
}
