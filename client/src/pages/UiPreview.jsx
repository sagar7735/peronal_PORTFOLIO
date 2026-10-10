import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Palette, Layers, Type, MousePointer, Square, ToggleLeft, MessageSquare, Star } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import GlassInput from '../components/ui/GlassInput'
import GlassTextarea from '../components/ui/GlassTextarea'
import GlassSelect from '../components/ui/GlassSelect'
import TagsInput from '../components/ui/TagsInput'
import FileDropzone from '../components/ui/FileDropzone'
import Badge from '../components/ui/Badge'
import SectionTitle from '../components/ui/SectionTitle'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Drawer from '../components/ui/Drawer'
import Loader from '../components/ui/Loader'
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { fadeUp, stagger } from '../utils/animations'

export default function UiPreview() {
  const { theme, toggleTheme } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [tags, setTags] = useState(['React', 'Node.js', 'MongoDB'])
  const [file, setFile] = useState(null)

  return (
    <div className="min-h-screen py-12 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold gradient-text">Design System Preview</h1>
          <p className="text-gray-400 mt-1">All glassmorphism UI components</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl glass hover:bg-white/10 transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-16">

        {/* Section Title */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-white mb-6 flex items-center gap-2"><Type className="w-5 h-5 text-purple-400" /> Section Title</h2>
          <SectionTitle tag="Portfolio" title="My Work & Projects" subtitle="A showcase of everything I've built — from full-stack web apps to mobile experiences." />
        </section>

        {/* Badges */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-white mb-6 flex items-center gap-2"><Layers className="w-5 h-5 text-purple-400" /> Badges / Chips</h2>
          <div className="flex flex-wrap gap-3">
            <Badge color="purple" dot>Available for Freelance</Badge>
            <Badge color="blue">React.js</Badge>
            <Badge color="cyan">Node.js</Badge>
            <Badge color="green">Completed</Badge>
            <Badge color="yellow">In Review</Badge>
            <Badge color="red">Rejected</Badge>
            <Badge color="pink">Featured</Badge>
            <Badge color="gray">Draft</Badge>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-white mb-6 flex items-center gap-2"><MousePointer className="w-5 h-5 text-purple-400" /> Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <GlassButton variant="primary">Primary</GlassButton>
            <GlassButton variant="secondary">Secondary</GlassButton>
            <GlassButton variant="outline">Outline</GlassButton>
            <GlassButton variant="danger">Danger</GlassButton>
            <GlassButton variant="ghost">Ghost</GlassButton>
            <GlassButton variant="primary" loading>Loading</GlassButton>
            <GlassButton variant="primary" size="sm">Small</GlassButton>
            <GlassButton variant="primary" size="lg">Large</GlassButton>
          </div>
        </section>

        {/* Glass Cards */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-white mb-6 flex items-center gap-2"><Square className="w-5 h-5 text-purple-400" /> Glass Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-2">Basic Card</h3>
              <p className="text-gray-400 text-sm">Glassmorphism card with backdrop blur, semi-transparent background, and subtle border.</p>
            </GlassCard>
            <GlassCard hover className="p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-2">Hover Card</h3>
              <p className="text-gray-400 text-sm">Lifts on hover with glow effect. Used for project cards and skill items.</p>
            </GlassCard>
            <GlassCard glow className="p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-2">Glow Card</h3>
              <p className="text-gray-400 text-sm">Always-on glow for featured or highlighted content.</p>
            </GlassCard>
          </div>
        </section>

        {/* Form Controls */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-white mb-6 flex items-center gap-2"><ToggleLeft className="w-5 h-5 text-purple-400" /> Form Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <GlassInput label="Full Name" placeholder="Sagar Kumar Jena" />
            <GlassInput label="Email" type="email" placeholder="jenasagar030@gmail.com" />
            <GlassInput label="With Error" placeholder="Enter value" error="This field is required" />
            <GlassSelect label="Project Type">
              <option value="">Select type</option>
              <option value="web">Website</option>
              <option value="app">Web App</option>
              <option value="mobile">Mobile App</option>
            </GlassSelect>
            <div className="md:col-span-2">
              <GlassTextarea label="Message" placeholder="Tell me about your project..." rows={3} />
            </div>
            <div className="md:col-span-2">
              <TagsInput label="Tech Stack" value={tags} onChange={setTags} placeholder="Add technology and press Enter" />
            </div>
            <div className="md:col-span-2">
              <FileDropzone label="Attachment" accept="image/*,.pdf" value={file} onChange={setFile} />
            </div>
          </div>
        </section>

        {/* Loaders & Skeletons */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-white mb-6 flex items-center gap-2"><Palette className="w-5 h-5 text-purple-400" /> Loaders & Skeletons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="p-8 flex items-center justify-center gap-8">
              <Loader size="sm" />
              <Loader size="md" />
              <Loader size="lg" text="Loading..." />
            </GlassCard>
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>

        {/* Empty State */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-white mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-400" /> Empty State</h2>
          <GlassCard>
            <EmptyState
              icon={Star}
              title="No testimonials yet"
              description="When clients submit reviews, they'll appear here after approval."
              action={<GlassButton variant="outline" size="sm">Invite a Client</GlassButton>}
            />
          </GlassCard>
        </section>

        {/* Overlays */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-white mb-6">Overlays (Modal / Confirm / Drawer)</h2>
          <div className="flex flex-wrap gap-4">
            <GlassButton onClick={() => setModalOpen(true)}>Open Modal</GlassButton>
            <GlassButton variant="outline" onClick={() => setConfirmOpen(true)}>Confirm Dialog</GlassButton>
            <GlassButton variant="secondary" onClick={() => setDrawerOpen(true)}>Open Drawer</GlassButton>
            <GlassButton variant="ghost" onClick={() => toast.success('Toast is working 🎉')}>Show Toast</GlassButton>
          </div>
        </section>

      </div>

      {/* Modals */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Glass Modal Example">
        <p className="text-gray-400 mb-4">This modal is built with glassmorphism styling, keyboard navigation (Esc to close), backdrop blur, and Framer Motion animations.</p>
        <div className="flex justify-end gap-3">
          <GlassButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</GlassButton>
          <GlassButton onClick={() => { setModalOpen(false); toast.success('Saved!') }}>Save Changes</GlassButton>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); toast.error('Deleted!') }}
        title="Delete this item?"
        message="This will permanently remove the item and all associated files. This cannot be undone."
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Application Details">
        <div className="space-y-4">
          <p className="text-gray-400">Drawers are used in the admin panel for viewing freelance application details without leaving the list view.</p>
          <GlassCard className="p-4 space-y-2">
            <p className="text-sm text-gray-300"><span className="text-gray-500">Name:</span> John Doe</p>
            <p className="text-sm text-gray-300"><span className="text-gray-500">Project:</span> E-commerce Website</p>
            <p className="text-sm text-gray-300"><span className="text-gray-500">Budget:</span> ₹50,000 – ₹1,00,000</p>
          </GlassCard>
        </div>
      </Drawer>
    </div>
  )
}
