import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ExternalLink, Github, Code2, Globe, Smartphone, Briefcase, Filter } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import GlassInput from '../components/ui/GlassInput'
import Badge from '../components/ui/Badge'
import SectionTitle from '../components/ui/SectionTitle'
import { SkeletonCard } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { projectsApi } from '../services/publicApi'
import { getImageUrl } from '../utils/getImageUrl'
import { fadeUp, scaleIn } from '../utils/animations'
import { cn } from '../utils/cn'

const CATEGORIES = ['All', 'Web', 'Mobile', 'Full Stack', 'Freelance']
const PAGE_SIZE = 9

const categoryIcon = { Web: Globe, Mobile: Smartphone, 'Full Stack': Code2, Freelance: Briefcase }

export default function Projects() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [projects, setProjects] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); setProjects([]) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reset on category change
  useEffect(() => { setPage(1); setProjects([]) }, [category])

  // Fetch
  useEffect(() => {
    const isFirst = page === 1
    if (isFirst) setLoading(true); else setLoadingMore(true)

    const params = { page, limit: PAGE_SIZE }
    if (category !== 'All') params.category = category
    if (search) params.search = search

    projectsApi.getAll(params)
      .then(res => {
        const data = res.data?.data
        setTotal(data?.total || 0)
        setProjects(prev => page === 1 ? (data?.projects || []) : [...prev, ...(data?.projects || [])])
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setLoadingMore(false) })
  }, [page, category, search])

  const hasMore = projects.length < total

  return (
    <>
      <Helmet>
        <title>Projects — Sagar Kumar Jena</title>
        <meta name="description" content="Explore Sagar Kumar Jena's portfolio of web, mobile, and full-stack projects." />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionTitle tag="Portfolio" title="My Projects" subtitle="A collection of things I've built — web apps, mobile apps, and everything in between." className="mb-12" />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-md focus:outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    category === cat
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glow'
                      : 'glass text-gray-400 hover:text-white hover:bg-white/10'
                  )}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState icon={Code2} title="No projects found" description="Try changing your filters or search term." />
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project, i) => {
                    const Icon = categoryIcon[project.category] || Code2
                    return (
                      <motion.div key={project._id} variants={fadeUp} initial="hidden" animate="visible"
                        exit={{opacity: 0, scale: 0.9}} transition={{delay: (i % PAGE_SIZE) * 0.05}}>
                        <GlassCard hover className="overflow-hidden h-full flex flex-col group">
                          {/* Thumbnail */}
                          <div className="relative h-48 bg-gradient-to-br from-purple-600/20 to-blue-600/20 overflow-hidden">
                            {project.thumbnail ? (
                              <img src={getImageUrl(project.thumbnail)} alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy" width={400} height={192} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon className="w-12 h-12 text-white/20" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3"><Badge color="purple">{project.category}</Badge></div>
                            {project.featured && <div className="absolute top-3 right-3"><Badge color="yellow">Featured</Badge></div>}
                          </div>

                          {/* Content */}
                          <div className="p-5 flex flex-col flex-1 gap-3">
                            <h3 className="font-heading font-bold text-white text-base">{project.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed flex-1">{project.shortDescription}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {project.techStack?.slice(0, 4).map(tech => <Badge key={tech} color="blue">{tech}</Badge>)}
                              {project.techStack?.length > 4 && <Badge color="gray">+{project.techStack.length - 4}</Badge>}
                            </div>
                            <div className="flex gap-2 mt-1">
                              {project.liveUrl && (
                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                  <GlassButton variant="primary" size="sm" className="w-full">
                                    <ExternalLink className="w-3.5 h-3.5" /> Live
                                  </GlassButton>
                                </a>
                              )}
                              {project.githubUrl && (
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                  <GlassButton variant="secondary" size="sm" className="w-full">
                                    <Github className="w-3.5 h-3.5" /> Code
                                  </GlassButton>
                                </a>
                              )}
                              <Link to={`/projects/${project.slug}`} className="flex-1">
                                <GlassButton variant="outline" size="sm" className="w-full">Details</GlassButton>
                              </Link>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    )
                  })}
                </div>
              </AnimatePresence>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-10">
                  <GlassButton variant="outline" size="lg" loading={loadingMore}
                    onClick={() => setPage(p => p + 1)}>
                    Load More Projects
                  </GlassButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
