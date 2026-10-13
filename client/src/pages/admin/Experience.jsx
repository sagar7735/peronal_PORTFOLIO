import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, GripVertical, Building2 } from 'lucide-react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import GlassCard from '../../components/ui/GlassCard'
import GlassButton from '../../components/ui/GlassButton'
import GlassInput from '../../components/ui/GlassInput'
import GlassTextarea from '../../components/ui/GlassTextarea'
import GlassSelect from '../../components/ui/GlassSelect'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import TagsInput from '../../components/ui/TagsInput'
import FileDropzone from '../../components/ui/FileDropzone'
import Skeleton from '../../components/ui/Skeleton'
import { useApi } from '../../hooks/useApi'
import { adminExperienceApi } from '../../services/adminApi'
import { getImageUrl } from '../../utils/getImageUrl'
import toast from 'react-hot-toast'

const schema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  type: z.enum(['Full-time', 'Freelance', 'Internship', 'Part-time']),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
})

function SortableExpRow({ exp, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exp._id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
      <button {...attributes} {...listeners} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none" aria-label="Drag">
        <GripVertical className="w-4 h-4" />
      </button>
      {exp.companyLogo ? (
        <img src={getImageUrl(exp.companyLogo)} alt={exp.company} className="w-10 h-10 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-purple-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm">{exp.role}</p>
        <p className="text-gray-400 text-xs">{exp.company}</p>
        <div className="flex gap-2 mt-1 flex-wrap">
          <Badge color="blue">{exp.type}</Badge>
          {exp.isCurrent && <Badge color="green" dot>Current</Badge>}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(exp)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => onDelete(exp)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  )
}

export default function Experience() {
  const { data: experience, loading, refetch } = useApi(adminExperienceApi.getAll)
  const [items, setItems] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExp, setEditingExp] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [logo, setLogo] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [techStack, setTechStack] = useState([])

  const displayItems = items ?? experience ?? []

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const isCurrent = watch('isCurrent')

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const openCreate = () => {
    setEditingExp(null)
    setLogo(null)
    setAchievements([])
    setTechStack([])
    reset({ company: '', role: '', type: 'Full-time', startDate: '', endDate: '', isCurrent: false, description: '' })
    setModalOpen(true)
  }

  const openEdit = (exp) => {
    setEditingExp(exp)
    setLogo(null)
    setAchievements(exp.achievements || [])
    setTechStack(exp.techStack || [])
    reset({
      company: exp.company,
      role: exp.role,
      type: exp.type,
      startDate: exp.startDate ? exp.startDate.substring(0, 10) : '',
      endDate: exp.endDate ? exp.endDate.substring(0, 10) : '',
      isCurrent: exp.isCurrent || false,
      description: exp.description || '',
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, String(v)) })
      fd.append('achievements', JSON.stringify(achievements))
      fd.append('techStack', JSON.stringify(techStack))
      if (logo) fd.append('companyLogo', logo)

      if (editingExp) {
        await adminExperienceApi.update(editingExp._id, fd)
        toast.success('Experience updated')
      } else {
        await adminExperienceApi.create(fd)
        toast.success('Experience added')
      }
      setModalOpen(false)
      await refetch()
      setItems(null)
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await adminExperienceApi.delete(deleteTarget._id)
      toast.success('Experience deleted')
      setDeleteTarget(null)
      await refetch()
      setItems(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIdx = displayItems.findIndex(e => e._id === active.id)
    const newIdx = displayItems.findIndex(e => e._id === over.id)
    const newOrder = arrayMove(displayItems, oldIdx, newIdx)
    setItems(newOrder)
    try {
      await adminExperienceApi.reorder(newOrder.map((e, i) => ({ id: e._id, order: i })))
    } catch { setItems(null) }
  }

  return (
    <>
      <Helmet><title>Experience — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Experience</h1>
            <p className="text-gray-400 text-sm mt-1">{displayItems.length} entries</p>
          </div>
          <GlassButton variant="primary" onClick={openCreate}><Plus className="w-4 h-4" /> Add Experience</GlassButton>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayItems.map(e => e._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {displayItems.map(exp => <SortableExpRow key={exp._id} exp={exp} onEdit={openEdit} onDelete={setDeleteTarget} />)}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingExp ? 'Edit Experience' : 'Add Experience'} size="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <GlassInput label="Company *" error={errors.company?.message} {...register('company')} />
              <GlassInput label="Role *" error={errors.role?.message} {...register('role')} />
            </div>
            <GlassSelect label="Type" {...register('type')}>
              <option>Full-time</option><option>Freelance</option><option>Internship</option><option>Part-time</option>
            </GlassSelect>
            <div className="grid grid-cols-2 gap-4">
              <GlassInput label="Start Date *" type="date" error={errors.startDate?.message} {...register('startDate')} />
              <GlassInput label="End Date" type="date" disabled={isCurrent} {...register('endDate')} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isCurrent" {...register('isCurrent')} className="accent-purple-600" />
              <label htmlFor="isCurrent" className="text-sm text-gray-300">Currently working here</label>
            </div>
            <GlassTextarea label="Description" rows={3} {...register('description')} />
            <TagsInput label="Achievements" value={achievements} onChange={setAchievements} placeholder="Add achievement and press Enter" />
            <TagsInput label="Tech Stack" value={techStack} onChange={setTechStack} placeholder="Add technology and press Enter" />
            <FileDropzone label="Company Logo (image)" accept="image/jpeg,image/png,image/webp" maxSizeMB={5} value={logo} onChange={setLogo} />
            <div className="flex justify-end gap-3 pt-2">
              <GlassButton type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</GlassButton>
              <GlassButton type="submit" variant="primary" loading={isSubmitting}>{editingExp ? 'Update' : 'Create'}</GlassButton>
            </div>
          </form>
        </Modal>

        <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
          title="Delete Experience" message={`Delete "${deleteTarget?.role} at ${deleteTarget?.company}"?`} loading={deleting} />
      </div>
    </>
  )
}
