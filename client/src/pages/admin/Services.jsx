import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, GripVertical, ToggleLeft, ToggleRight } from 'lucide-react'
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
import TagsInput from '../../components/ui/TagsInput'
import Skeleton from '../../components/ui/Skeleton'
import { useApi } from '../../hooks/useApi'
import { adminServicesApi } from '../../services/adminApi'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().optional(),
  startingPrice: z.coerce.number().min(0).optional(),
  deliveryTime: z.string().optional(),
  active: z.boolean().optional(),
})

function SortableServiceRow({ service, onEdit, onDelete, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: service._id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
      <button {...attributes} {...listeners} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none" aria-label="Drag">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm">{service.title}</p>
        <p className="text-gray-500 text-xs mt-0.5">
          {service.startingPrice > 0 && `\u20B9${service.startingPrice.toLocaleString('en-IN')} \u00B7 `}
          {service.deliveryTime}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge color={service.active ? 'green' : 'gray'}>{service.active ? 'Active' : 'Inactive'}</Badge>
        <button onClick={() => onToggle(service)} className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-all" aria-label="Toggle active">
          {service.active ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
        </button>
        <button onClick={() => onEdit(service)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => onDelete(service)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  )
}

export default function Services() {
  const { data: services, loading, refetch } = useApi(adminServicesApi.getAll)
  const [items, setItems] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [features, setFeatures] = useState([])

  const displayItems = items ?? services ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const openCreate = () => {
    setEditingService(null)
    setFeatures([])
    reset({ title: '', description: '', icon: '', startingPrice: 0, deliveryTime: '', active: true })
    setModalOpen(true)
  }

  const openEdit = (s) => {
    setEditingService(s)
    setFeatures(s.features || [])
    reset({ title: s.title, description: s.description, icon: s.icon || '', startingPrice: s.startingPrice || 0, deliveryTime: s.deliveryTime || '', active: s.active })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, features: JSON.stringify(features) }
      if (editingService) {
        await adminServicesApi.update(editingService._id, payload)
        toast.success('Service updated')
      } else {
        await adminServicesApi.create(payload)
        toast.success('Service created')
      }
      setModalOpen(false)
      await refetch()
      setItems(null)
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    }
  }

  const toggleActive = async (service) => {
    try {
      await adminServicesApi.update(service._id, { active: !service.active })
      await refetch()
      setItems(null)
    } catch { toast.error('Failed to toggle') }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await adminServicesApi.delete(deleteTarget._id)
      toast.success('Service deleted')
      setDeleteTarget(null)
      await refetch()
      setItems(null)
    } catch (err) { toast.error(err.message || 'Failed') } finally { setDeleting(false) }
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return
    const newOrder = arrayMove(displayItems, displayItems.findIndex(s => s._id === active.id), displayItems.findIndex(s => s._id === over.id))
    setItems(newOrder)
    try { await adminServicesApi.reorder(newOrder.map((s, i) => ({ id: s._id, order: i }))) } catch { setItems(null) }
  }

  return (
    <>
      <Helmet><title>Services — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div><h1 className="font-heading text-2xl font-bold text-white">Services</h1><p className="text-gray-400 text-sm mt-1">{displayItems.length} services</p></div>
          <GlassButton variant="primary" onClick={openCreate}><Plus className="w-4 h-4" /> Add Service</GlassButton>
        </div>

        {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div> : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayItems.map(s => s._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {displayItems.map(s => <SortableServiceRow key={s._id} service={s} onEdit={openEdit} onDelete={setDeleteTarget} onToggle={toggleActive} />)}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingService ? 'Edit Service' : 'Add Service'} size="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <GlassInput label="Title *" error={errors.title?.message} {...register('title')} />
            <GlassTextarea label="Description *" rows={3} error={errors.description?.message} {...register('description')} />
            <div className="grid grid-cols-2 gap-4">
              <GlassInput label="Starting Price (\u20B9)" type="number" {...register('startingPrice')} />
              <GlassInput label="Delivery Time" placeholder="7-14 days" {...register('deliveryTime')} />
            </div>
            <TagsInput label="Features" value={features} onChange={setFeatures} placeholder="Add feature and press Enter" />
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" {...register('active')} className="accent-purple-600" /> Active (show on public site)
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <GlassButton type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</GlassButton>
              <GlassButton type="submit" variant="primary" loading={isSubmitting}>{editingService ? 'Update' : 'Create'}</GlassButton>
            </div>
          </form>
        </Modal>

        <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
          title="Delete Service" message={`Delete "${deleteTarget?.title}"?`} loading={deleting} />
      </div>
    </>
  )
}
