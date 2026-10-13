import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GripVertical, Pencil, Trash2, CheckCircle, XCircle, Star } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import GlassCard from '../../components/ui/GlassCard'
import GlassButton from '../../components/ui/GlassButton'
import GlassInput from '../../components/ui/GlassInput'
import GlassTextarea from '../../components/ui/GlassTextarea'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useApi } from '../../hooks/useApi'
import { adminTestimonialsApi } from '../../services/adminApi'
import { getImageUrl } from '../../utils/getImageUrl'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

const schema = z.object({
  clientName: z.string().min(1),
  clientRole: z.string().optional(),
  company: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  message: z.string().min(10),
})

function SortableTestimonialRow({ t, onEdit, onDelete, onToggleApprove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: t._id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
      <button {...attributes} {...listeners} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none mt-1" aria-label="Drag">
        <GripVertical className="w-4 h-4" />
      </button>
      {t.avatar ? (
        <img src={getImageUrl(t.avatar)} alt={t.clientName} className="w-10 h-10 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center text-white font-bold text-sm shrink-0">{t.clientName[0]}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-white font-medium text-sm">{t.clientName}</p>
          {t.clientRole && <span className="text-gray-500 text-xs">\u00B7 {t.clientRole}</span>}
          {t.company && <span className="text-gray-500 text-xs">\u00B7 {t.company}</span>}
        </div>
        <div className="flex gap-0.5 mb-1">
          {[...Array(5)].map((_, i) => <Star key={i} className={cn('w-3 h-3', i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600')} />)}
        </div>
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{t.message}</p>
        <div className="mt-1.5"><Badge color={t.approved ? 'green' : 'yellow'}>{t.approved ? 'Approved' : 'Pending'}</Badge></div>
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <button onClick={() => onToggleApprove(t)} className={cn('p-1.5 rounded-lg transition-all', t.approved ? 'text-green-400 hover:bg-red-500/10 hover:text-red-400' : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10')} aria-label={t.approved ? 'Unapprove' : 'Approve'}>
          {t.approved ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => onDelete(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const { data: testimonials, loading, refetch } = useApi(adminTestimonialsApi.getAll)
  const [items, setItems] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingT, setEditingT] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const displayItems = items ?? testimonials ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const openEdit = (t) => {
    setEditingT(t)
    reset({ clientName: t.clientName, clientRole: t.clientRole || '', company: t.company || '', rating: t.rating, message: t.message })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      await adminTestimonialsApi.update(editingT._id, data)
      toast.success('Testimonial updated')
      setModalOpen(false)
      await refetch()
      setItems(null)
    } catch (err) { toast.error(err.message || 'Failed') }
  }

  const toggleApprove = async (t) => {
    try {
      await adminTestimonialsApi.update(t._id, { approved: !t.approved })
      await refetch()
      setItems(null)
      toast.success(t.approved ? 'Unapproved' : 'Approved')
    } catch { toast.error('Failed') }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await adminTestimonialsApi.delete(deleteTarget._id)
      toast.success('Testimonial deleted')
      setDeleteTarget(null)
      await refetch()
      setItems(null)
    } catch (err) { toast.error(err.message || 'Failed') } finally { setDeleting(false) }
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return
    const newOrder = arrayMove(displayItems, displayItems.findIndex(t => t._id === active.id), displayItems.findIndex(t => t._id === over.id))
    setItems(newOrder)
    try { await adminTestimonialsApi.reorder(newOrder.map((t, i) => ({ id: t._id, order: i }))) } catch { setItems(null) }
  }

  return (
    <>
      <Helmet><title>Testimonials — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Testimonials</h1>
            <p className="text-gray-400 text-sm mt-1">
              {displayItems.filter(t => !t.approved).length} pending \u00B7 {displayItems.filter(t => t.approved).length} approved
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : displayItems.length === 0 ? (
          <EmptyState icon={Star} title="No testimonials yet" description="Client reviews will appear here after submission." />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayItems.map(t => t._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {displayItems.map(t => <SortableTestimonialRow key={t._id} t={t} onEdit={openEdit} onDelete={setDeleteTarget} onToggleApprove={toggleApprove} />)}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Testimonial" size="md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <GlassInput label="Client Name *" error={errors.clientName?.message} {...register('clientName')} />
            <div className="grid grid-cols-2 gap-4">
              <GlassInput label="Client Role" {...register('clientRole')} />
              <GlassInput label="Company" {...register('company')} />
            </div>
            <GlassInput label="Rating (1-5)" type="number" min="1" max="5" error={errors.rating?.message} {...register('rating')} />
            <GlassTextarea label="Message *" rows={4} error={errors.message?.message} {...register('message')} />
            <div className="flex justify-end gap-3 pt-2">
              <GlassButton type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</GlassButton>
              <GlassButton type="submit" variant="primary" loading={isSubmitting}>Update</GlassButton>
            </div>
          </form>
        </Modal>

        <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
          title="Delete Testimonial" message={`Delete review from "${deleteTarget?.clientName}"?`} loading={deleting} />
      </div>
    </>
  )
}
