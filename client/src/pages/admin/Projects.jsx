import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, GripVertical, X, ExternalLink } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors
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
import { adminProjectsApi } from '../../services/adminApi'
import { getImageUrl } from '../../utils/getImageUrl'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  shortDescription: z.string().min(1, 'Short description required'),
  fullDescription: z.string().optional(),
  category: z.enum(['Web', 'Mobile', 'Full Stack', 'Freelance']),
  liveUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  featured: z.boolean().optional(),
  isClientProject: z.boolean().optional(),
  clientName: z.string().optional(),
  status: z.enum(['published', 'draft']),
})

const STATUS_COLOR = { published: 'green', draft: 'gray' }

function SortableProjectRow({ project, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project._id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
      <button {...attributes} {...listeners} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none" aria-label="Drag">
        <GripVertical className="w-4 h-4" />
      </button>
      {project.thumbnail ? (
        <img src={getImageUrl(project.thumbnail)} alt={project.title} className="w-14 h-10 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-14 h-10 rounded-lg bg-white/5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{project.title}</p>
        <div className="flex gap-1.5 mt-0.5 flex-wrap">
          <Badge color="purple">{project.category}</Badge>
          <Badge color={STATUS_COLOR[project.status]}>{project.status}</Badge>
          {project.featured && <Badge color="yellow">Featured</Badge>}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-cyan-400 transition-all"><ExternalLink className="w-3.5 h-3.5" /></a>}
        <button onClick={() => onEdit(project)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => onDelete(project)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  )
}

export default function Projects() {
  const { data, loading, refetch } = useApi(() => adminProjectsApi.getAll())
  const projects = data?.projects || []
  const [items, setItems] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [thumbnail, setThumbnail] = useState(null)
  const [newImages, setNewImages] = useState([])
  const [techStack, setTechStack] = useState([])

  const displayItems = items ?? projects

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const isFeatured = watch('featured')
  const isClientProject = watch('isClientProject')

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const openCreate = () => {
    setEditingProject(null)
    setThumbnail(null)
    setNewImages([])
    setTechStack([])
    reset({ title: '', shortDescription: '', fullDescription: '', category: 'Web', liveUrl: '', githubUrl: '', featured: false, isClientProject: false, clientName: '', status: 'draft' })
    setModalOpen(true)
  }

  const openEdit = (project) => {
    setEditingProject(project)
    setThumbnail(null)
    setNewImages([])
    setTechStack(project.techStack || [])
    reset({
      title: project.title,
      shortDescription: project.shortDescription,
      fullDescription: project.fullDescription || '',
      category: project.category,
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      featured: project.featured || false,
      isClientProject: project.isClientProject || false,
      clientName: project.clientName || '',
      status: project.status,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== '') fd.append(k, String(v))
      })
      fd.append('techStack', JSON.stringify(techStack))
      if (thumbnail) fd.append('thumbnail', thumbnail)
      newImages.forEach(img => fd.append('images', img))

      if (editingProject) {
        await adminProjectsApi.update(editingProject._id, fd)
        toast.success('Project updated')
      } else {
        await adminProjectsApi.create(fd)
        toast.success('Project created')
      }
      setModalOpen(false)
      await refetch()
      setItems(null)
    } catch (err) {
      toast.error(err.message || 'Failed to save project')
    }
  }

  const removeImage = async (project, imagePath) => {
    try {
      await adminProjectsApi.removeImage(project._id, { imagePath })
      await refetch()
      setItems(null)
      toast.success('Image removed')
    } catch {
      toast.error('Failed to remove image')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await adminProjectsApi.delete(deleteTarget._id)
      toast.success('Project deleted')
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
    const oldIdx = displayItems.findIndex(p => p._id === active.id)
    const newIdx = displayItems.findIndex(p => p._id === over.id)
    const newOrder = arrayMove(displayItems, oldIdx, newIdx)
    setItems(newOrder)
    try {
      await adminProjectsApi.reorder(newOrder.map((p, i) => ({ id: p._id, order: i })))
    } catch { setItems(null) }
  }

  return (
    <>
      <Helmet><title>Projects — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 text-sm mt-1">{displayItems.length} projects</p>
          </div>
          <GlassButton variant="primary" onClick={openCreate}><Plus className="w-4 h-4" /> Add Project</GlassButton>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayItems.map(p => p._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {displayItems.map(project => <SortableProjectRow key={project._id} project={project} onEdit={openEdit} onDelete={setDeleteTarget} />)}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingProject ? 'Edit Project' : 'Add Project'} size="xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <GlassInput label="Title *" error={errors.title?.message} {...register('title')} />
            <GlassTextarea label="Short Description *" rows={2} error={errors.shortDescription?.message} {...register('shortDescription')} />
            <GlassTextarea label="Full Description" rows={4} {...register('fullDescription')} />
            <div className="grid grid-cols-2 gap-4">
              <GlassSelect label="Category" {...register('category')}>
                <option>Web</option><option>Mobile</option><option>Full Stack</option><option>Freelance</option>
              </GlassSelect>
              <GlassSelect label="Status" {...register('status')}>
                <option value="draft">Draft</option><option value="published">Published</option>
              </GlassSelect>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <GlassInput label="Live URL" placeholder="https://..." {...register('liveUrl')} />
              <GlassInput label="GitHub URL" placeholder="https://github.com/..." {...register('githubUrl')} />
            </div>
            <TagsInput label="Tech Stack" value={techStack} onChange={setTechStack} placeholder="Add tech and press Enter" />

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" {...register('featured')} className="accent-purple-600" /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" {...register('isClientProject')} className="accent-purple-600" /> Client Project
              </label>
            </div>
            {isClientProject && <GlassInput label="Client Name" {...register('clientName')} />}

            <FileDropzone label="Thumbnail" accept="image/jpeg,image/png,image/webp" value={thumbnail} onChange={setThumbnail} />

            {editingProject?.images?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Existing Images</p>
                <div className="flex flex-wrap gap-2">
                  {editingProject.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={getImageUrl(img)} alt="" className="w-20 h-14 rounded-lg object-cover border border-white/10" />
                      <button type="button" onClick={() => removeImage(editingProject, img)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FileDropzone label="Add More Images (up to 8 total)" accept="image/jpeg,image/png,image/webp" multiple value={newImages} onChange={setNewImages} />

            <div className="flex justify-end gap-3 pt-2">
              <GlassButton type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</GlassButton>
              <GlassButton type="submit" variant="primary" loading={isSubmitting}>{editingProject ? 'Update' : 'Create'}</GlassButton>
            </div>
          </form>
        </Modal>

        <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
          title="Delete Project" message={`Delete "${deleteTarget?.title}"? All images will be removed from the server.`} loading={deleting} />
      </div>
    </>
  )
}
