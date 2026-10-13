import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import GlassCard from '../../components/ui/GlassCard'
import GlassButton from '../../components/ui/GlassButton'
import GlassInput from '../../components/ui/GlassInput'
import GlassSelect from '../../components/ui/GlassSelect'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Skeleton from '../../components/ui/Skeleton'
import { useApi } from '../../hooks/useApi'
import { adminSkillsApi } from '../../services/adminApi'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

const CATEGORIES = ['Frontend', 'Backend', 'Mobile', 'Database', 'Tools']
const CATEGORY_COLORS = { Frontend: 'blue', Backend: 'green', Mobile: 'pink', Database: 'yellow', Tools: 'gray' }

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['Frontend', 'Backend', 'Mobile', 'Database', 'Tools']),
  level: z.coerce.number().int().min(0).max(100),
  icon: z.string().optional(),
})

function SortableSkillRow({ skill, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill._id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
      <button {...attributes} {...listeners} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none" aria-label="Drag to reorder">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-medium text-sm">{skill.name}</span>
          <Badge color={CATEGORY_COLORS[skill.category] || 'gray'}>{skill.category}</Badge>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full w-48 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-500" style={{ width: `${skill.level}%` }} />
        </div>
        <span className="text-xs text-gray-500 mt-0.5 block">{skill.level}%</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(skill)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Edit">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(skill)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" aria-label="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function Skills() {
  const { data: skills, loading, refetch } = useApi(adminSkillsApi.getAll)
  const [items, setItems] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [filterCategory, setFilterCategory] = useState('All')

  const displayItems = items ?? skills ?? []
  const filtered = filterCategory === 'All' ? displayItems : displayItems.filter(s => s.category === filterCategory)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const openCreate = () => { setEditingSkill(null); reset({ name: '', category: 'Frontend', level: 80, icon: '' }); setModalOpen(true) }
  const openEdit = (skill) => { setEditingSkill(skill); reset({ name: skill.name, category: skill.category, level: skill.level, icon: skill.icon || '' }); setModalOpen(true) }

  const onSubmit = async (data) => {
    try {
      if (editingSkill) {
        await adminSkillsApi.update(editingSkill._id, data)
        toast.success('Skill updated')
      } else {
        await adminSkillsApi.create(data)
        toast.success('Skill created')
      }
      setModalOpen(false)
      await refetch()
      setItems(null)
    } catch (err) {
      toast.error(err.message || 'Failed to save skill')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminSkillsApi.delete(deleteTarget._id)
      toast.success('Skill deleted')
      setDeleteTarget(null)
      await refetch()
      setItems(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = displayItems.findIndex(s => s._id === active.id)
    const newIndex = displayItems.findIndex(s => s._id === over.id)
    const newOrder = arrayMove(displayItems, oldIndex, newIndex)
    setItems(newOrder)
    try {
      await adminSkillsApi.reorder(newOrder.map((s, i) => ({ id: s._id, order: i })))
    } catch {
      setItems(null)
    }
  }

  return (
    <>
      <Helmet><title>Skills — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Skills</h1>
            <p className="text-gray-400 text-sm mt-1">{displayItems.length} skills · drag to reorder</p>
          </div>
          <GlassButton variant="primary" onClick={openCreate}><Plus className="w-4 h-4" /> Add Skill</GlassButton>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filterCategory === cat ? 'bg-purple-600 text-white' : 'glass text-gray-400 hover:text-white')}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map(s => s._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {filtered.map(skill => (
                  <SortableSkillRow key={skill._id} skill={skill} onEdit={openEdit} onDelete={setDeleteTarget} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingSkill ? 'Edit Skill' : 'Add Skill'} size="sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <GlassInput label="Skill Name *" placeholder="React.js" error={errors.name?.message} {...register('name')} />
            <GlassSelect label="Category *" error={errors.category?.message} {...register('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </GlassSelect>
            <GlassInput label="Level (0-100) *" type="number" min="0" max="100" error={errors.level?.message} {...register('level')} />
            <div className="flex justify-end gap-3 pt-2">
              <GlassButton type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</GlassButton>
              <GlassButton type="submit" variant="primary" loading={isSubmitting}>
                {editingSkill ? 'Update' : 'Create'}
              </GlassButton>
            </div>
          </form>
        </Modal>

        <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
          title="Delete Skill" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} loading={deleting} />
      </div>
    </>
  )
}
