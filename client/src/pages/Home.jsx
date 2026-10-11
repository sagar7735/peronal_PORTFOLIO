import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Download, ArrowRight, ChevronRight, ExternalLink, Github,
  MapPin, Mail, Phone, Briefcase, Code2, Star, Quote,
  ChevronLeft, Smartphone, Globe, Send, Zap, CheckCircle,
  Building2
} from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import GlassInput from '../components/ui/GlassInput'
import GlassTextarea from '../components/ui/GlassTextarea'
import Badge from '../components/ui/Badge'
import SectionTitle from '../components/ui/SectionTitle'
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton'
import { useApi } from '../hooks/useApi'
import { profileApi, skillsApi, experienceApi, projectsApi, servicesApi, testimonialsApi, contactApi } from '../services/publicApi'
import { getImageUrl } from '../utils/getImageUrl'
import { fadeUp, stagger, scaleIn } from '../utils/animations'
import { cn } from '../utils/cn'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Typing animation hook
function useTypingAnimation(words, speed = 100, pause = 2000) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!words.length) return
    const word = words[wordIdx]
    let timeout
    if (!deleting && charIdx < word.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed)
    } else if (!deleting && charIdx === word.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2)
    } else if (deleting && charIdx === 0) {
      setDeleting(false)
      setWordIdx(i => (i + 1) % words.length)
    }
    setDisplay(word.substring(0, charIdx))
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, wordIdx, words, speed, pause])

  return display
}

// StatCard sub-component so useRef/useInView/useEffect are at top level
function StatCard({ stat, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const numeric = parseInt(String(stat.value).replace(/\D/g, ''), 10)
    if (!numeric) return
    let start = 0
    const step = Math.max(1, Math.ceil(numeric / 80))
    const timer = setInterval(() => {
      start += step
      if (start >= numeric) { setCount(numeric); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, stat.value])

  const suffix = String(stat.value).replace(/[0-9]/g, '')

  return (
    <motion.div
      ref={ref}
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{once: true}}
    >
      <GlassCard hover className="p-6 text-center">
        <p className="font-heading text-3xl sm:text-4xl font-bold gradient-text">{count}{suffix}</p>
        <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
      </GlassCard>
    </motion.div>
  )
}

// Contact schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message is too short'),
})

// Hero section
function Hero({ profile }) {
  const typedText = useTypingAnimation([
    'Full Stack Developer',
    'React Native Developer',
    'Android Developer',
    'Freelancer',
  ])

  const handleDownloadResume = () => {
    if (profile?.resumeUrl) {
      window.open(getImageUrl(profile.resumeUrl), '_blank')
    } else {
      toast.error('Resume not available yet')
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={fadeUp}>
            <GlassCard className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">Full Stack Developer @</span>
              <span className="text-white font-semibold">Excerpt Technologies Pvt Ltd</span>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-2">
            <p className="text-gray-400 text-lg">Hi there, I'm</p>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Sagar Kumar<br />
              <span className="gradient-text">Jena</span>
            </h1>
          </motion.div>

          <motion.div variants={fadeUp} className="h-10">
            <p className="text-xl sm:text-2xl text-gray-300 font-medium">
              <span className="gradient-text">{typedText}</span>
              <span className="animate-pulse text-purple-400 ml-0.5">|</span>
            </p>
          </motion.div>

          <motion.p variants={fadeUp} className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl">
            {profile?.tagline || 'Building modern web & mobile experiences — fast, clean, and production-ready.'}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-2">
            <Link to="/freelance">
              <GlassButton variant="primary" size="lg">
                Hire Me for Freelance <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </Link>
            <GlassButton variant="secondary" size="lg" onClick={handleDownloadResume}>
              <Download className="w-4 h-4" /> Download Resume
            </GlassButton>
          </motion.div>
        </motion.div>

        {/* Right: Avatar */}
        <motion.div
          initial={{opacity: 0, scale: 0.8}}
          animate={{opacity: 1, scale: 1}}
          transition={{duration: 0.8, ease: 'easeOut', delay: 0.2}}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/30 to-cyan-600/30 blur-3xl scale-110" />
            <GlassCard glow className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden flex items-center justify-center">
              {profile?.avatar ? (
                <img src={getImageUrl(profile.avatar)} alt="Sagar Kumar Jena" className="w-full h-full object-cover" loading="eager" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center">
                  <span className="font-heading text-6xl font-bold gradient-text">SK</span>
                </div>
              )}
            </GlassCard>

            {/* Floating tech badges */}
            <motion.div animate={{y: [0, -8, 0]}} transition={{duration: 3, repeat: Infinity, ease: 'easeInOut'}}
              className="absolute -top-4 -right-4">
              <GlassCard className="px-3 py-2 text-xs font-medium text-cyan-400 whitespace-nowrap">React.js ⚛️</GlassCard>
            </motion.div>
            <motion.div animate={{y: [0, 8, 0]}} transition={{duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5}}
              className="absolute -bottom-4 -left-4">
              <GlassCard className="px-3 py-2 text-xs font-medium text-purple-400 whitespace-nowrap">Node.js 🚀</GlassCard>
            </motion.div>
            <motion.div animate={{x: [0, -6, 0]}} transition={{duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1}}
              className="absolute top-1/2 -left-16 -translate-y-1/2">
              <GlassCard className="px-3 py-2 text-xs font-medium text-pink-400 whitespace-nowrap">MongoDB 🌿</GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 2}}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <motion.div animate={{y: [0, 8, 0]}} transition={{duration: 1.5, repeat: Infinity}}
          className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-purple-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Stats section
function Stats({ profile }) {
  const stats = profile?.stats?.length
    ? profile.stats
    : [
        { label: 'Years of Experience', value: '2+' },
        { label: 'Projects Completed', value: '20+' },
        { label: 'Happy Clients', value: '15+' },
        { label: 'Technologies', value: '11+' },
      ]
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)}
        </div>
      </div>
    </section>
  )
}

// About section
function About({ profile }) {
  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle tag="About Me" title="Who I Am" className="mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once: true}}>
            <GlassCard className="p-8 space-y-6">
              <p className="text-gray-300 leading-relaxed">
                {profile?.bio || "I'm a Full Stack Developer at Excerpt Technologies Pvt Ltd, passionate about building scalable web and mobile applications."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { icon: MapPin, label: 'Location', value: profile?.location || 'Bangalore, India' },
                  { icon: Building2, label: 'Company', value: profile?.currentCompany || 'Excerpt Technologies' },
                  { icon: Briefcase, label: 'Role', value: profile?.currentRole || 'Full Stack Developer' },
                  { icon: Mail, label: 'Email', value: profile?.email || 'jenasagar030@gmail.com' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-600/20 mt-0.5 shrink-0">
                      <Icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                      <p className="text-white text-sm font-medium mt-0.5 break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{once: true}} className="space-y-4">
            {[
              { icon: Code2, title: 'Clean Code', desc: 'Writing maintainable, scalable code following best practices and design patterns.' },
              { icon: Zap, title: 'Fast Delivery', desc: 'Efficient development workflow with on-time delivery and clear communication.' },
              { icon: CheckCircle, title: 'Post-Launch Support', desc: 'Available after delivery for bug fixes, updates, and ongoing improvements.' },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={fadeUp}>
                <GlassCard hover className="p-5 flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 shrink-0">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-white text-sm">{title}</h3>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">{desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Skills section
function Skills({ skills }) {
  const categories = ['All', 'Frontend', 'Backend', 'Mobile', 'Database', 'Tools']
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? skills
    : skills?.filter(s => s.category === activeCategory)

  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle tag="Skills" title="Technologies I Work With" className="mb-10" />
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                activeCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glow'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/10'
              )}>
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered?.map((skill) => (
              <motion.div key={skill._id} layout variants={scaleIn} initial="hidden" animate="visible" exit={{opacity: 0, scale: 0.9}}>
                <GlassCard hover className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-white text-sm">{skill.name}</span>
                    <span className="text-xs text-gray-500">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-500"
                      initial={{width: 0}}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{once: true}}
                      transition={{duration: 1, ease: 'easeOut', delay: 0.1}}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{skill.category}</p>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

// Experience section
function Experience({ experience }) {
  return (
    <section id="experience" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle tag="Experience" title="My Work History" className="mb-12" />
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-600/60 via-blue-600/40 to-transparent" />
          <div className="space-y-8">
            {experience?.map((exp) => (
              <motion.div key={exp._id} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{once: true, margin: '-50px'}} className="relative pl-20">
                <div className="absolute left-6 top-5 w-5 h-5 rounded-full border-2 border-purple-500 bg-gray-950 -translate-x-1/2 z-10" />
                <GlassCard hover className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-white text-base">{exp.role}</h3>
                      <p className="text-purple-400 text-sm font-medium">{exp.company}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {exp.isCurrent && <Badge color="green" dot>Current</Badge>}
                      <Badge color="gray">
                        {new Date(exp.startDate).getFullYear()} — {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                      </Badge>
                      <Badge color="blue">{exp.type}</Badge>
                    </div>
                  </div>
                  {exp.description && <p className="text-gray-400 text-sm leading-relaxed mb-3">{exp.description}</p>}
                  {exp.achievements?.length > 0 && (
                    <ul className="space-y-1.5 mb-3">
                      {exp.achievements.map((a, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                          <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />{a}
                        </li>
                      ))}
                    </ul>
                  )}
                  {exp.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {exp.techStack.map(tech => <Badge key={tech} color="purple">{tech}</Badge>)}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Featured Projects section
function FeaturedProjects() {
  const { data, loading } = useApi(() => projectsApi.getAll({ featured: true, limit: 3 }))
  const projects = data?.projects || []

  return (
    <section id="projects" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle tag="Work" title="Featured Projects" subtitle="A selection of my best work" className="mb-12" />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.div key={project._id} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{once: true}} transition={{delay: i * 0.1}}>
                <GlassCard hover className="overflow-hidden h-full flex flex-col group">
                  <div className="relative h-48 bg-gradient-to-br from-purple-600/20 to-blue-600/20 overflow-hidden">
                    {project.thumbnail ? (
                      <img src={getImageUrl(project.thumbnail)} alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy" width={400} height={192} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Code2 className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3"><Badge color="purple">{project.category}</Badge></div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <h3 className="font-heading font-bold text-white">{project.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed flex-1">{project.shortDescription}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack?.slice(0, 4).map(tech => <Badge key={tech} color="blue">{tech}</Badge>)}
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
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Link to="/projects">
            <GlassButton variant="outline" size="lg">View All Projects <ArrowRight className="w-4 h-4" /></GlassButton>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Services section
function ServicesPreview() {
  const { data: services, loading } = useApi(servicesApi.getAll)

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle tag="Services" title="What I Offer" subtitle="From idea to launch — I handle it all" className="mb-12" />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services?.map((service, i) => (
              <motion.div key={service._id} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{once: true}} transition={{delay: i * 0.1}}>
                <GlassCard hover className="p-6 h-full flex flex-col gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 w-fit">
                    <Globe className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white text-base">{service.title}</h3>
                    <p className="text-gray-400 text-sm mt-1 leading-relaxed">{service.description}</p>
                  </div>
                  <ul className="space-y-1.5 flex-1">
                    {service.features?.slice(0, 4).map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-gray-300">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  {service.startingPrice > 0 && (
                    <p className="text-sm text-gray-400 mt-auto">
                      Starting from <span className="text-cyan-400 font-bold text-base">₹{service.startingPrice.toLocaleString('en-IN')}</span>
                    </p>
                  )}
                  <Link to="/freelance">
                    <GlassButton variant="outline" size="sm" className="w-full mt-1">
                      Get a Quote <ArrowRight className="w-3.5 h-3.5" />
                    </GlassButton>
                  </Link>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Testimonials section
function Testimonials() {
  const { data: testimonials } = useApi(testimonialsApi.getAll)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!testimonials?.length) return
    const timer = setInterval(() => setCurrent(c => (c + 1) % testimonials.length), 5000)
    return () => clearInterval(timer)
  }, [testimonials])

  if (!testimonials?.length) return null

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle tag="Testimonials" title="What Clients Say" className="mb-12" />
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{opacity: 0, x: 40}} animate={{opacity: 1, x: 0}}
              exit={{opacity: 0, x: -40}} transition={{duration: 0.4}}>
              <GlassCard className="p-8">
                <Quote className="w-8 h-8 text-purple-400/40 mb-4" />
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 italic">
                  "{testimonials[current].message}"
                </p>
                <div className="flex items-center gap-4">
                  {testimonials[current].avatar ? (
                    <img src={getImageUrl(testimonials[current].avatar)} alt={testimonials[current].clientName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30" loading="lazy" width={48} height={48} />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {testimonials[current].clientName[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white text-sm">{testimonials[current].clientName}</p>
                    <p className="text-gray-500 text-xs">
                      {testimonials[current].clientRole}
                      {testimonials[current].company && ` · ${testimonials[current].company}`}
                    </p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(testimonials[current].rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => setCurrent(c => (c - 1 + testimonials.length) % testimonials.length)}
              className="p-2 rounded-xl glass hover:bg-white/10 transition-all" aria-label="Previous">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={cn('h-2 rounded-full transition-all duration-300', i === current ? 'bg-purple-500 w-4' : 'bg-white/20 w-2')}
                  aria-label={`Testimonial ${i + 1}`} />
              ))}
            </div>
            <button onClick={() => setCurrent(c => (c + 1) % testimonials.length)}
              className="p-2 rounded-xl glass hover:bg-white/10 transition-all" aria-label="Next">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="text-center mt-6">
            <Link to="/testimonial" className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
              Leave a review →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// CTA Banner section
function CTABanner() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{once: true}}>
          <GlassCard glow className="p-10 sm:p-14 text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-cyan-600/10 pointer-events-none" />
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white relative z-10">Have a project in mind?</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto relative z-10">
              Let's build something amazing together. I'm available for freelance projects and collaborations.
            </p>
            <div className="flex flex-wrap gap-3 justify-center relative z-10">
              <Link to="/freelance">
                <GlassButton variant="primary" size="lg">Start a Project <ArrowRight className="w-4 h-4" /></GlassButton>
              </Link>
              <a href="https://wa.me/917735802848?text=Hi%20Sagar%2C%20I%20want%20to%20discuss%20a%20freelance%20project" target="_blank" rel="noopener noreferrer">
                <GlassButton variant="secondary" size="lg">Chat on WhatsApp</GlassButton>
              </a>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}

// Contact section
function Contact({ profile }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data) => {
    try {
      await contactApi.send(data)
      toast.success("Message sent! I'll get back to you soon.")
      reset()
    } catch (err) {
      toast.error(err.message || 'Failed to send message')
    }
  }

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle tag="Contact" title="Get In Touch" subtitle="Have a project or just want to say hi? Drop me a message." className="mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-4">
            {[
              { icon: Mail, label: 'Email', value: profile?.email || 'jenasagar030@gmail.com', href: `mailto:${profile?.email || 'jenasagar030@gmail.com'}` },
              { icon: Phone, label: 'Phone / WhatsApp', value: `+91 ${profile?.phone || '7735802848'}`, href: `https://wa.me/91${profile?.whatsapp || '7735802848'}` },
              { icon: MapPin, label: 'Location', value: profile?.location || 'Bangalore, India', href: null },
            ].map(({ icon: Icon, label, value, href }) => (
              <motion.div key={label} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once: true}}>
                <GlassCard hover className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-600/20 shrink-0"><Icon className="w-5 h-5 text-purple-400" /></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                        className="text-white text-sm font-medium hover:text-purple-400 transition-colors">{value}</a>
                    ) : (
                      <p className="text-white text-sm font-medium">{value}</p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div className="lg:col-span-3" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once: true}}>
            <GlassCard className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <input type="text" className="hidden" tabIndex={-1} aria-hidden="true" {...register('website')} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassInput label="Your Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
                  <GlassInput label="Email Address" type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} />
                </div>
                <GlassInput label="Subject" placeholder="Project inquiry, collaboration..." error={errors.subject?.message} {...register('subject')} />
                <GlassTextarea label="Message" placeholder="Tell me about your project or just say hi!" rows={5} error={errors.message?.message} {...register('message')} />
                <GlassButton type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
                  <Send className="w-4 h-4" /> Send Message
                </GlassButton>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Main Home page
export default function Home() {
  const { data: profile } = useApi(profileApi.get)
  const { data: skills } = useApi(skillsApi.getAll)
  const { data: experience } = useApi(experienceApi.getAll)

  return (
    <>
      <Helmet>
        <title>Sagar Kumar Jena — Full Stack Developer & Freelancer</title>
        <meta name="description" content="Sagar Kumar Jena is a Full Stack Developer at Excerpt Technologies Pvt Ltd, building modern web and mobile applications. Available for freelance projects." />
        <meta property="og:title" content="Sagar Kumar Jena — Full Stack Developer & Freelancer" />
        <meta property="og:description" content="Building modern web & mobile experiences — fast, clean, and production-ready." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Hero profile={profile} />
      <Stats profile={profile} />
      <About profile={profile} />
      <Skills skills={skills} />
      <Experience experience={experience} />
      <FeaturedProjects />
      <ServicesPreview />
      <Testimonials />
      <CTABanner />
      <Contact profile={profile} />
    </>
  )
}
