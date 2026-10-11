import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, ExternalLink, Github, X, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import Badge from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Loader'
import { useApi } from '../hooks/useApi'
import { projectsApi } from '../services/publicApi'
import { getImageUrl } from '../utils/getImageUrl'
import { fadeUp } from '../utils/animations'

function Lightbox({ images, current, onClose, onPrev, onNext }) {
  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl glass text-white hover:bg-white/20 transition-all" aria-label="Close">
        <X className="w-6 h-6" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onPrev() }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl glass text-white hover:bg-white/20 transition-all" aria-label="Previous">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <motion.img
        key={current}
        src={getImageUrl(images[current])}
        alt={`Image ${current + 1}`}
        initial={{opacity: 0, scale: 0.9}}
        animate={{opacity: 1, scale: 1}}
        exit={{opacity: 0, scale: 0.9}}
        className="max-w-5xl max-h-[85vh] w-full h-auto object-contain rounded-2xl"
        onClick={e => e.stopPropagation()}
      />
      <button onClick={(e) => { e.stopPropagation(); onNext() }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl glass text-white hover:bg-white/20 transition-all" aria-label="Next">
        <ChevronRight className="w-6 h-6" />
      </button>
      <div className="absolute bottom-4 text-gray-400 text-sm">{current + 1} / {images.length}</div>
    </motion.div>
  )
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const { data, loading } = useApi(() => projectsApi.getBySlug(slug), [slug])
  const project = data?.project
  const prev = data?.prev
  const next = data?.next

  const allImages = project ? [
    ...(project.thumbnail ? [project.thumbnail] : []),
    ...(project.images || []),
  ] : []

  const openLightbox = (idx) => { setLightboxIndex(idx); setLightboxOpen(true) }
  const closeLightbox = () => setLightboxOpen(false)
  const prevImage = () => setLightboxIndex(i => (i - 1 + allImages.length) % allImages.length)
  const nextImage = () => setLightboxIndex(i => (i + 1) % allImages.length)

  if (loading) return <PageLoader />
  if (!project) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-white mb-4">Project not found</h1>
        <Link to="/projects"><GlassButton variant="primary">Back to Projects</GlassButton></Link>
      </div>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>{project.title} — Sagar Kumar Jena</title>
        <meta name="description" content={project.shortDescription} />
      </Helmet>

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox images={allImages} current={lightboxIndex} onClose={closeLightbox} onPrev={prevImage} onNext={nextImage} />
        )}
      </AnimatePresence>

      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
            <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Projects
            </button>
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge color="purple">{project.category}</Badge>
                  {project.featured && <Badge color="yellow">Featured</Badge>}
                  {project.isClientProject && <Badge color="cyan">Client Project</Badge>}
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white">{project.title}</h1>
                {project.isClientProject && project.clientName && (
                  <p className="text-gray-400 mt-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-400" /> Client: {project.clientName}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <GlassButton variant="primary"><ExternalLink className="w-4 h-4" /> Live Demo</GlassButton>
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <GlassButton variant="secondary"><Github className="w-4 h-4" /> Source Code</GlassButton>
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Image Gallery */}
          {allImages.length > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
              {/* Main image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer mb-3"
                onClick={() => openLightbox(0)}>
                <img src={getImageUrl(allImages[0])} alt={project.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="eager" />
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg glass text-white text-xs font-medium">
                    +{allImages.length - 1} more
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => openLightbox(i)}
                      className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === 0 ? 'border-purple-500' : 'border-white/10 hover:border-white/30'}`}>
                      <img src={getImageUrl(img)} alt={`${project.title} ${i + 1}`}
                        className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Description */}
            <motion.div className="lg:col-span-2" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once: true}}>
              <GlassCard className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-white mb-3">About this project</h2>
                  <p className="text-gray-300 leading-relaxed">
                    {project.fullDescription || project.shortDescription}
                  </p>
                </div>
                {project.techStack?.length > 0 && (
                  <div>
                    <h3 className="font-heading font-semibold text-white mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map(tech => <Badge key={tech} color="purple">{tech}</Badge>)}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once: true}} className="space-y-4">
              <GlassCard className="p-5 space-y-4">
                <h3 className="font-heading font-semibold text-white">Project Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Category</p>
                    <Badge color="purple">{project.category}</Badge>
                  </div>
                  {project.isClientProject && project.clientName && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Client</p>
                      <p className="text-white text-sm">{project.clientName}</p>
                    </div>
                  )}
                  {project.liveUrl && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Live URL</p>
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 text-sm hover:text-purple-300 transition-colors break-all">{project.liveUrl}</a>
                    </div>
                  )}
                  {project.githubUrl && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Repository</p>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 text-sm hover:text-purple-300 transition-colors break-all">{project.githubUrl}</a>
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <p className="text-gray-400 text-sm mb-4">Interested in a similar project?</p>
                <Link to="/freelance">
                  <GlassButton variant="primary" className="w-full">Hire Me</GlassButton>
                </Link>
              </GlassCard>
            </motion.div>
          </div>

          {/* Prev / Next */}
          {(prev || next) && (
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once: true}}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
              {prev ? (
                <Link to={`/projects/${prev.slug}`}>
                  <GlassCard hover className="p-5 flex items-center gap-3 group">
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Previous</p>
                      <p className="text-white text-sm font-medium">{prev.title}</p>
                    </div>
                  </GlassCard>
                </Link>
              ) : <div />}
              {next && (
                <Link to={`/projects/${next.slug}`}>
                  <GlassCard hover className="p-5 flex items-center justify-end gap-3 text-right group">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Next</p>
                      <p className="text-white text-sm font-medium">{next.title}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors shrink-0" />
                  </GlassCard>
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
