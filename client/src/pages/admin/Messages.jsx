import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Mail, Reply, Trash2, CheckCheck } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import GlassButton from '../../components/ui/GlassButton'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { adminMessagesApi } from '../../services/adminApi'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [filter, setFilter] = useState('all')

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (filter === 'unread') params.isRead = 'false'
      if (filter === 'replied') params.isReplied = 'true'
      const res = await adminMessagesApi.getAll(params)
      setMessages(res.data?.data?.messages || [])
      setTotal(res.data?.data?.total || 0)
    } catch { toast.error('Failed to load messages') } finally { setLoading(false) }
  }

  useEffect(() => { fetchMessages() }, [page, filter])

  const openMessage = async (msg) => {
    setSelected(msg)
    if (!msg.isRead) {
      try {
        await adminMessagesApi.getOne(msg._id)
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m))
        setSelected({ ...msg, isRead: true })
      } catch {}
    }
  }

  const markReplied = async (msg) => {
    try {
      await adminMessagesApi.update(msg._id, { isReplied: true })
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isReplied: true } : m))
      if (selected?._id === msg._id) setSelected(s => ({ ...s, isReplied: true }))
      toast.success('Marked as replied')
    } catch { toast.error('Failed') }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await adminMessagesApi.delete(deleteTarget._id)
      setMessages(prev => prev.filter(m => m._id !== deleteTarget._id))
      if (selected?._id === deleteTarget._id) setSelected(null)
      setDeleteTarget(null)
      toast.success('Message deleted')
    } catch (err) { toast.error(err.message || 'Failed') } finally { setDeleting(false) }
  }

  return (
    <>
      <Helmet><title>Messages — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Messages</h1>
            <p className="text-gray-400 text-sm mt-1">{total} messages \u00B7 {messages.filter(m => !m.isRead).length} unread</p>
          </div>
          <div className="flex gap-2">
            {['all', 'unread', 'replied'].map(f => (
              <button key={f} onClick={() => { setFilter(f); setPage(1) }}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filter === f ? 'bg-purple-600 text-white' : 'glass text-gray-400 hover:text-white')}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            {loading ? (
              <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : messages.length === 0 ? (
              <EmptyState icon={Mail} title="No messages" description="Contact form messages will appear here." />
            ) : (
              messages.map(msg => (
                <button key={msg._id} onClick={() => openMessage(msg)} className={cn(
                  'w-full text-left p-4 rounded-xl border transition-all',
                  selected?._id === msg._id
                    ? 'border-purple-500/50 bg-purple-600/10'
                    : msg.isRead ? 'border-white/10 bg-white/5 hover:bg-white/8' : 'border-purple-500/20 bg-white/5 hover:bg-white/8',
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm truncate', !msg.isRead ? 'text-white font-semibold' : 'text-gray-300')}>{msg.name}</p>
                      <p className={cn('text-xs truncate mt-0.5', !msg.isRead ? 'text-gray-300' : 'text-gray-500')}>{msg.subject}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <p className="text-gray-600 text-[10px]">{new Date(msg.createdAt).toLocaleDateString('en-IN')}</p>
                      {!msg.isRead && <span className="w-2 h-2 rounded-full bg-purple-500" />}
                      {msg.isReplied && <Badge color="green" className="text-[10px] px-1.5 py-0.5">Replied</Badge>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div>
            {selected ? (
              <GlassCard className="p-6 space-y-4 sticky top-20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-bold text-white">{selected.subject}</h3>
                    <p className="text-gray-400 text-sm mt-1">{selected.name} \u00B7 <a href={`mailto:${selected.email}`} className="text-purple-400 hover:underline">{selected.email}</a></p>
                    <p className="text-gray-600 text-xs mt-0.5">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!selected.isReplied && (
                      <button onClick={() => markReplied(selected)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all" aria-label="Mark replied">
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setDeleteTarget(selected)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`} className="flex-1" target="_blank" rel="noopener noreferrer">
                    <GlassButton variant="primary" size="sm" className="w-full"><Reply className="w-3.5 h-3.5" /> Reply via Email</GlassButton>
                  </a>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-8 flex items-center justify-center h-48">
                <p className="text-gray-500 text-sm">Select a message to read it</p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        title="Delete Message" message={`Delete message from "${deleteTarget?.name}"?`} loading={deleting} />
    </>
  )
}
