import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Download, Filter, Mail, MessageSquare, Trash2, Eye } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import GlassButton from '../../components/ui/GlassButton'
import GlassTextarea from '../../components/ui/GlassTextarea'
import Badge from '../../components/ui/Badge'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { adminFreelanceApi } from '../../services/adminApi'
import toast from 'react-hot-toast'

const STATUSES = ['new', 'reviewing', 'accepted', 'in-progress', 'completed', 'rejected']
const STATUS_COLOR = { new: 'purple', reviewing: 'blue', accepted: 'green', 'in-progress': 'cyan', completed: 'green', rejected: 'red' }
const PROJECT_TYPES = ['Website', 'Web App', 'Mobile App', 'E-commerce', 'UI Redesign', 'Other']

export default function FreelanceApplications() {
  const [applications, setApplications] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [projectTypeFilter, setProjectTypeFilter] = useState('')
  const [waitlistFilter, setWaitlistFilter] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [sendEmail, setSendEmail] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => { setPage(1) }, [statusFilter, projectTypeFilter, waitlistFilter])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (projectTypeFilter) params.projectType = projectTypeFilter
      if (waitlistFilter) params.isWaitlist = waitlistFilter
      const res = await adminFreelanceApi.getAll(params)
      setApplications(res.data?.data?.applications || [])
      setTotal(res.data?.data?.total || 0)
    } catch { toast.error('Failed to load applications') } finally { setLoading(false) }
  }

  useEffect(() => { fetchApplications() }, [page, search, statusFilter, projectTypeFilter, waitlistFilter])

  const openDrawer = (app) => {
    setSelectedApp(app)
    setNewStatus(app.status)
    setAdminNotes(app.adminNotes || '')
    setSendEmail(false)
    setDrawerOpen(true)
  }

  const updateStatus = async () => {
    if (!selectedApp) return
    setUpdatingStatus(true)
    try {
      await adminFreelanceApi.update(selectedApp._id, { status: newStatus, adminNotes, sendEmail })
      toast.success('Application updated' + (sendEmail ? ' \u00B7 Email sent' : ''))
      setDrawerOpen(false)
      fetchApplications()
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await adminFreelanceApi.delete(deleteTarget._id)
      toast.success('Application deleted')
      setDeleteTarget(null)
      fetchApplications()
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setDeleting(false)
    }
  }

  const exportCsv = async () => {
    try {
      const res = await adminFreelanceApi.exportCsv()
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'freelance-applications.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Export failed') }
  }

  return (
    <>
      <Helmet><title>Applications — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Freelance Applications</h1>
            <p className="text-gray-400 text-sm mt-1">{total} total applications</p>
          </div>
          <GlassButton variant="secondary" onClick={exportCsv}><Download className="w-4 h-4" /> Export CSV</GlassButton>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search name or email..."
              className="pl-9 pr-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-md focus:outline-none focus:border-purple-500/70 w-48" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white backdrop-blur-md focus:outline-none focus:border-purple-500/70">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={projectTypeFilter} onChange={e => setProjectTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white backdrop-blur-md focus:outline-none focus:border-purple-500/70">
            <option value="">All Types</option>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={waitlistFilter} onChange={e => setWaitlistFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white backdrop-blur-md focus:outline-none focus:border-purple-500/70">
            <option value="">All</option>
            <option value="false">Active</option>
            <option value="true">Waitlist</option>
          </select>
        </div>

        <GlassCard className="overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
          ) : applications.length === 0 ? (
            <EmptyState icon={Filter} title="No applications found" description="Try adjusting your filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Client', 'Project Type', 'Budget', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {applications.map(app => (
                    <tr key={app._id} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white text-sm font-medium">{app.clientName}</p>
                        <p className="text-gray-500 text-xs">{app.email}</p>
                        {app.isWaitlist && <Badge color="yellow" className="mt-1">Waitlist</Badge>}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{app.projectType}</td>
                      <td className="px-4 py-3 text-cyan-400 text-sm font-medium">{app.budgetRange}</td>
                      <td className="px-4 py-3"><Badge color={STATUS_COLOR[app.status] || 'gray'}>{app.status}</Badge></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => openDrawer(app)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label="View">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(app)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" aria-label="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {total > 15 && (
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">Page {page} of {Math.ceil(total / 15)}</p>
            <div className="flex gap-2">
              <GlassButton variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</GlassButton>
              <GlassButton variant="secondary" size="sm" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next</GlassButton>
            </div>
          </div>
        )}

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Application Details" width="max-w-xl">
          {selectedApp && (
            <div className="space-y-5">
              <GlassCard className="p-4 space-y-2">
                <h3 className="font-semibold text-white text-sm mb-3">Client Info</h3>
                {[
                  ['Name', selectedApp.clientName],
                  ['Email', selectedApp.email],
                  ['Phone', selectedApp.phone],
                  ['Company', selectedApp.company],
                  ['Preferred Contact', selectedApp.preferredContact],
                ].filter(([_, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <span className="text-gray-500 text-xs w-28 shrink-0">{label}</span>
                    <span className="text-white text-xs">{value}</span>
                  </div>
                ))}
              </GlassCard>

              <GlassCard className="p-4 space-y-2">
                <h3 className="font-semibold text-white text-sm mb-3">Project Info</h3>
                {[
                  ['Type', selectedApp.projectType],
                  ['Budget', selectedApp.budgetRange],
                  ['Timeline', selectedApp.timeline],
                ].filter(([_, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <span className="text-gray-500 text-xs w-28 shrink-0">{label}</span>
                    <span className="text-white text-xs">{value}</span>
                  </div>
                ))}
                {selectedApp.description && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-gray-500 text-xs mb-1">Description</p>
                    <p className="text-gray-300 text-xs leading-relaxed">{selectedApp.description}</p>
                  </div>
                )}
                {selectedApp.referenceLinks?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-gray-500 text-xs mb-1">Reference Links</p>
                    {selectedApp.referenceLinks.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-purple-400 text-xs hover:underline block truncate">{link}</a>
                    ))}
                  </div>
                )}
              </GlassCard>

              {selectedApp.attachmentPath && (
                <a href={adminFreelanceApi.getAttachmentUrl(selectedApp._id)} target="_blank" rel="noopener noreferrer">
                  <GlassButton variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4" /> Download Attachment
                  </GlassButton>
                </a>
              )}

              <div className="flex gap-2">
                <a href={`mailto:${selectedApp.email}`} className="flex-1">
                  <GlassButton variant="secondary" size="sm" className="w-full"><Mail className="w-3.5 h-3.5" /> Reply via Email</GlassButton>
                </a>
                {selectedApp.phone && (
                  <a href={`https://wa.me/91${selectedApp.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <GlassButton variant="secondary" size="sm" className="w-full"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</GlassButton>
                  </a>
                )}
              </div>

              <GlassCard className="p-4 space-y-3">
                <h3 className="font-semibold text-white text-sm">Update Status</h3>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/70">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <GlassTextarea label="Admin Notes" rows={3} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Internal notes (not visible to client)" />
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="accent-purple-600" />
                  Send status update email to client
                </label>
                <GlassButton variant="primary" className="w-full" loading={updatingStatus} onClick={updateStatus}>
                  Save Changes
                </GlassButton>
              </GlassCard>
            </div>
          )}
        </Drawer>

        <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
          title="Delete Application" message={`Delete application from "${deleteTarget?.clientName}"? Attachment will be removed.`} loading={deleting} />
      </div>
    </>
  )
}