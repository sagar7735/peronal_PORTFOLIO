import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle, ArrowRight, ArrowLeft, Upload, Briefcase, Globe, Smartphone,
  ShoppingCart, Layout, HelpCircle, Clock, DollarSign, Zap, Shield, HeadphonesIcon,
  MessageSquare, Phone, Mail, Star, Send, AlertCircle
} from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import GlassInput from '../components/ui/GlassInput'
import GlassTextarea from '../components/ui/GlassTextarea'
import GlassSelect from '../components/ui/GlassSelect'
import Badge from '../components/ui/Badge'
import SectionTitle from '../components/ui/SectionTitle'
import FileDropzone from '../components/ui/FileDropzone'
import TagsInput from '../components/ui/TagsInput'
import { useApi } from '../hooks/useApi'
import { profileApi, servicesApi, freelanceApi } from '../services/publicApi'
import { cn } from '../utils/cn'
import toast from 'react-hot-toast'

const PROJECT_TYPES = [
  { value: 'Website', label: 'Website', icon: Globe },
  { value: 'Web App', label: 'Web App', icon: Briefcase },
  { value: 'Mobile App', label: 'Mobile App', icon: Smartphone },
  { value: 'E-commerce', label: 'E-commerce', icon: ShoppingCart },
  { value: 'UI Redesign', label: 'UI Redesign', icon: Layout },
  { value: 'Other', label: 'Other', icon: HelpCircle },
]

const BUDGET_RANGES = [
  '₹5,000 – ₹15,000',
  '₹15,000 – ₹30,000',
  '₹30,000 – ₹60,000',
  '₹60,000 – ₹1,00,000',
  '₹1,00,000 – ₹2,00,000',
  '₹2,00,000+',
]

const TIMELINES = [
  '< 1 week',
  '1–2 weeks',
  '2–4 weeks',
  '1–2 months',
  '2–3 months',
  '3+ months',
  'Flexible',
]

// Zod schemas per step
const step1Schema = z.object({
  clientName: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  company: z.string().max(200).optional(),
})

const step2Schema = z.object({
  projectType: z.enum(['Website', 'Web App', 'Mobile App', 'E-commerce', 'UI Redesign', 'Other'], {
    errorMap: () => ({ message: 'Please select a project type' }),
  }),
  description: z.string().min(10, 'Please describe your project (min 10 characters)').max(5000),
})

const step3Schema = z.object({
  budgetRange: z.string().min(1, 'Please select a budget range'),
  timeline: z.string().min(1, 'Please select a timeline'),
  preferredContact: z.enum(['Email', 'Phone', 'WhatsApp']),
})

// Confetti component
function Confetti() {
  const colors = ['#7C3AED', '#2563EB', '#06B6D4', '#EC4899', '#10B981', '#F59E0B']
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {pieces.map(p => (
        <motion.div key={p.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{left: p.left, backgroundColor: p.color, top: '-10px'}}
          animate={{y: ['0vh', '110vh'], rotate: [0, 720], opacity: [1, 0.5, 0]}}
          transition={{duration: p.duration, delay: p.delay, ease: 'easeIn'}}
        />
      ))}
    </div>
  )
}

const STEPS = ['Your Details', 'Project Info', 'Budget & Timeline', 'Review & Submit']

export default function Freelance() {
  const { data: profile } = useApi(profileApi.get)
  const { data: services } = useApi(servicesApi.getAll)
  const available = profile?.availableForFreelance !== false

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [referenceLinks, setReferenceLinks] = useState([])
  const [attachment, setAttachment] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const schemas = [step1Schema, step2Schema, step3Schema]
  const { register, handleSubmit, watch, setValue, formState: { errors }, reset, trigger } = useForm({
    resolver: zodResolver(schemas[currentStep] || z.object({})),
    defaultValues: formData,
  })

  const watchedProjectType = watch('projectType')
  const watchedBudget = watch('budgetRange')
  const watchedTimeline = watch('timeline')
  const watchedContact = watch('preferredContact', 'Email')

  const nextStep = async () => {
    const valid = await trigger()
    if (!valid) return
    const values = watch()
    setFormData(prev => ({ ...prev, ...values }))
    setCurrentStep(s => Math.min(s + 1, 3))
  }

  const prevStep = () => {
    setFormData(prev => ({ ...prev, ...watch() }))
    setCurrentStep(s => Math.max(s - 1, 0))
  }

  const onSubmit = async () => {
    setSubmitting(true)
    try {
      const fd = new FormData()
      const all = { ...formData, ...watch(), referenceLinks: JSON.stringify(referenceLinks) }

      // Remove honeypot
      Object.entries(all).forEach(([k, v]) => {
        if (k !== 'website' && v !== undefined && v !== '') fd.append(k, v)
      })

      // Hidden honeypot
      fd.append('website', '')

      if (attachment) fd.append('attachment', attachment)

      await freelanceApi.apply(fd)
      setSubmitted(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (err) {
      toast.error(err.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Process sections (before form)
  const processSteps = [
    { icon: MessageSquare, title: 'Discuss', desc: 'We talk about your vision, goals, and requirements.' },
    { icon: Layout, title: 'Plan', desc: 'I create a detailed plan, timeline, and cost breakdown.' },
    { icon: Zap, title: 'Design', desc: 'UI/UX design with your feedback and approval.' },
    { icon: Briefcase, title: 'Develop', desc: 'Clean, scalable code built to production standards.' },
    { icon: CheckCircle, title: 'Deliver & Support', desc: 'Launch, handover, and ongoing support.' },
  ]

  const whyHireMe = [
    { icon: Zap, title: 'Fast Delivery', desc: 'On-time delivery with regular updates.' },
    { icon: Shield, title: 'Clean Code', desc: 'Maintainable, well-documented code.' },
    { icon: Globe, title: 'Responsive Design', desc: 'Looks great on every device.' },
    { icon: HeadphonesIcon, title: 'Post-Launch Support', desc: 'Available after delivery for help.' },
  ]

  const faqItems = [
    { q: 'How long does a typical project take?', a: 'It depends on scope. A simple website takes 1–2 weeks; a full-stack app can take 4–8 weeks. I always give you a clear timeline upfront.' },
    { q: 'Do you work with clients outside India?', a: 'Yes! I work with international clients. Payments via PayPal, Wise, or bank transfer.' },
    { q: 'What happens after project delivery?', a: 'I offer 1–3 months of post-launch support depending on the service package, including bug fixes and minor updates.' },
    { q: 'Can I see the source code?', a: "Absolutely. You own the code. I push everything to your GitHub repository or deliver a full source code package." },
    { q: 'Do you sign NDAs?', a: 'Yes, I\'m happy to sign an NDA before discussing your project details.' },
  ]

  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
      <Helmet>
        <title>Hire Me for Freelance — Sagar Kumar Jena</title>
        <meta name="description" content="Available for freelance web and mobile app development. Website, Web App, Mobile App, E-commerce — get a free quote." />
      </Helmet>

      {showConfetti && <Confetti />}

      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-6">
              <span className={cn('w-2 h-2 rounded-full', available ? 'bg-green-400 animate-pulse' : 'bg-red-400')} />
              <span className="text-gray-300">
                {available ? 'Currently available for freelance work' : 'Currently fully booked'}
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              Let's Build Something <span className="gradient-text">Amazing</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              I help businesses and individuals bring their ideas to life with clean, modern, production-ready code.
            </p>
          </div>

          {/* Services */}
          {services?.length > 0 && (
            <section className="mb-20">
              <SectionTitle tag="Services" title="What I Build" className="mb-10" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map((s, i) => (
                  <motion.div key={s._id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    initial="hidden" whileInView="visible" viewport={{once: true}} transition={{delay: i * 0.1}}>
                    <GlassCard hover className="p-6 h-full flex flex-col gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 w-fit">
                        <Globe className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="font-heading font-bold text-white">{s.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed flex-1">{s.description}</p>
                      <ul className="space-y-1.5">
                        {s.features?.slice(0, 4).map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-xs text-gray-300">
                            <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                      {s.startingPrice > 0 && (
                        <p className="text-sm text-gray-400">
                          Starting from <span className="text-cyan-400 font-bold text-base">₹{s.startingPrice.toLocaleString('en-IN')}</span>
                        </p>
                      )}
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* How I Work */}
          <section className="mb-20">
            <SectionTitle tag="Process" title="How I Work" className="mb-10" />
            <div className="flex flex-col md:flex-row gap-0 max-w-4xl mx-auto">
              {processSteps.map((step, i) => (
                <div key={i} className="flex-1 flex flex-col items-center text-center relative">
                  {i < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-blue-500/50 z-0" />
                  )}
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    initial="hidden" whileInView="visible" viewport={{once: true}} transition={{delay: i * 0.1}}
                    className="relative z-10 flex flex-col items-center gap-3 px-4 py-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-heading font-semibold text-white text-sm">{step.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </section>

          {/* Why Hire Me */}
          <section className="mb-20">
            <SectionTitle tag="Why Me" title="Why Work With Me" className="mb-10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {whyHireMe.map(({ icon: Icon, title, desc }, i) => (
                <motion.div key={i} variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                  initial="hidden" whileInView="visible" viewport={{once: true}} transition={{delay: i * 0.1}}>
                  <GlassCard hover className="p-5 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center mx-auto">
                      <Icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="font-heading font-semibold text-white text-sm">{title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* MULTI-STEP FORM */}
          <section id="apply" className="mb-20">
            <SectionTitle
              tag={available ? "Get a Quote" : "Join Waitlist"}
              title={available ? "Start Your Project" : "Currently Fully Booked"}
              subtitle={available
                ? "Fill out the form below and I'll get back to you within 24–48 hours."
                : "I'm currently at full capacity. Join the waitlist and I'll contact you when I'm available."
              }
              className="mb-10"
            />

            {!available && (
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                initial="hidden" animate="visible"
                className="max-w-xl mx-auto mb-8">
                <GlassCard className="p-5 flex items-start gap-4 border-yellow-500/30">
                  <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-yellow-300 text-sm">I'm currently fully booked. By submitting this form, you'll be added to the waitlist and I'll reach out when I have availability.</p>
                </GlassCard>
              </motion.div>
            )}

            <div className="max-w-2xl mx-auto">
              {submitted ? (
                <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}}>
                  <GlassCard glow className="p-10 text-center space-y-5">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-white">
                      {available ? "Request Submitted!" : "Added to Waitlist!"}
                    </h2>
                    <p className="text-gray-400">
                      {available
                        ? "Thanks! I've received your project request and will get back to you within 24–48 hours. Check your email for a confirmation."
                        : "You're on the waitlist! I'll contact you personally as soon as I have availability. Thanks for your patience."
                      }
                    </p>
                    <GlassButton variant="primary" onClick={() => { setSubmitted(false); setCurrentStep(0); setFormData({}); reset() }}>
                      Submit Another Request
                    </GlassButton>
                  </GlassCard>
                </motion.div>
              ) : (
                <GlassCard className="p-6 sm:p-8">
                  {/* Progress */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      {STEPS.map((step, i) => (
                        <div key={i} className="flex items-center">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                            i < currentStep ? 'bg-green-500 text-white' :
                            i === currentStep ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-glow' :
                            'bg-white/10 text-gray-500'
                          )}>
                            {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={cn('h-0.5 w-8 sm:w-16 mx-1 transition-all', i < currentStep ? 'bg-green-500' : 'bg-white/10')} />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-sm text-gray-400">
                      Step {currentStep + 1} of {STEPS.length}: <span className="text-white font-medium">{STEPS[currentStep]}</span>
                    </p>
                  </div>

                  {/* Honeypot */}
                  <input type="text" className="hidden" tabIndex={-1} aria-hidden="true" {...register('website')} />

                  <AnimatePresence mode="wait">
                    {/* STEP 1: Your Details */}
                    {currentStep === 0 && (
                      <motion.div key="step1" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} className="space-y-5">
                        <GlassInput label="Full Name *" placeholder="John Doe" error={errors.clientName?.message} {...register('clientName')} defaultValue={formData.clientName} />
                        <GlassInput label="Email Address *" type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} defaultValue={formData.email} />
                        <GlassInput label="Phone / WhatsApp" placeholder="+91 98765 43210" {...register('phone')} defaultValue={formData.phone} />
                        <GlassInput label="Company (optional)" placeholder="Your company name" {...register('company')} defaultValue={formData.company} />
                      </motion.div>
                    )}

                    {/* STEP 2: Project Details */}
                    {currentStep === 1 && (
                      <motion.div key="step2" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} className="space-y-5">
                        <div>
                          <label className="text-sm font-medium text-gray-300 block mb-3">Project Type *</label>
                          {errors.projectType && <p className="text-xs text-red-400 mb-2">{errors.projectType.message}</p>}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {PROJECT_TYPES.map(({ value, label, icon: Icon }) => (
                              <button key={value} type="button"
                                onClick={() => setValue('projectType', value, { shouldValidate: true })}
                                className={cn(
                                  'flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all',
                                  watchedProjectType === value
                                    ? 'border-purple-500 bg-purple-600/20 text-white'
                                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white'
                                )}>
                                <Icon className="w-5 h-5" />{label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <GlassTextarea label="Project Description *" placeholder="Describe your project — what it does, who it's for, key features..." rows={5} error={errors.description?.message} {...register('description')} defaultValue={formData.description} />
                        <TagsInput label="Reference Links (optional)" value={referenceLinks} onChange={setReferenceLinks} placeholder="Paste a URL and press Enter" />
                      </motion.div>
                    )}

                    {/* STEP 3: Budget & Timeline */}
                    {currentStep === 2 && (
                      <motion.div key="step3" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} className="space-y-6">
                        <div>
                          <label className="text-sm font-medium text-gray-300 block mb-3">Budget Range *</label>
                          {errors.budgetRange && <p className="text-xs text-red-400 mb-2">{errors.budgetRange.message}</p>}
                          <div className="flex flex-wrap gap-2">
                            {BUDGET_RANGES.map(range => (
                              <button key={range} type="button"
                                onClick={() => setValue('budgetRange', range, { shouldValidate: true })}
                                className={cn(
                                  'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                                  watchedBudget === range
                                    ? 'border-cyan-500 bg-cyan-600/20 text-cyan-300'
                                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white'
                                )}>
                                {range}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-300 block mb-3">Timeline *</label>
                          {errors.timeline && <p className="text-xs text-red-400 mb-2">{errors.timeline.message}</p>}
                          <div className="flex flex-wrap gap-2">
                            {TIMELINES.map(t => (
                              <button key={t} type="button"
                                onClick={() => setValue('timeline', t, { shouldValidate: true })}
                                className={cn(
                                  'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                                  watchedTimeline === t
                                    ? 'border-purple-500 bg-purple-600/20 text-purple-300'
                                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white'
                                )}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-300 block mb-3">Preferred Contact Method</label>
                          <div className="flex gap-3">
                            {[{ v: 'Email', icon: Mail }, { v: 'Phone', icon: Phone }, { v: 'WhatsApp', icon: MessageSquare }].map(({ v, icon: Icon }) => (
                              <button key={v} type="button"
                                onClick={() => setValue('preferredContact', v)}
                                className={cn(
                                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
                                  watchedContact === v
                                    ? 'border-purple-500 bg-purple-600/20 text-white'
                                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                                )}>
                                <Icon className="w-4 h-4" />{v}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 4: Attachment + Review */}
                    {currentStep === 3 && (
                      <motion.div key="step4" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} className="space-y-6">
                        <FileDropzone
                          label="Attachment (optional — design mockups, brief PDF, etc.)"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          maxSizeMB={5}
                          value={attachment}
                          onChange={setAttachment}
                        />

                        {/* Review summary */}
                        <div>
                          <h3 className="font-heading font-semibold text-white mb-4">Review Your Request</h3>
                          <GlassCard className="p-5 space-y-3">
                            {[
                              { label: 'Name', value: formData.clientName },
                              { label: 'Email', value: formData.email },
                              { label: 'Phone', value: formData.phone },
                              { label: 'Company', value: formData.company },
                              { label: 'Project Type', value: formData.projectType },
                              { label: 'Budget', value: formData.budgetRange },
                              { label: 'Timeline', value: formData.timeline },
                              { label: 'Contact Via', value: formData.preferredContact },
                            ].filter(item => item.value).map(({ label, value }) => (
                              <div key={label} className="flex items-start gap-3">
                                <span className="text-gray-500 text-sm w-28 shrink-0">{label}</span>
                                <span className="text-white text-sm font-medium">{value}</span>
                              </div>
                            ))}
                            {formData.description && (
                              <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                                <span className="text-gray-500 text-sm w-28 shrink-0">Description</span>
                                <span className="text-white text-sm">{formData.description?.substring(0, 100)}{formData.description?.length > 100 ? '...' : ''}</span>
                              </div>
                            )}
                          </GlassCard>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                    <GlassButton variant="secondary" onClick={prevStep} disabled={currentStep === 0}>
                      <ArrowLeft className="w-4 h-4" /> Back
                    </GlassButton>
                    {currentStep < 3 ? (
                      <GlassButton variant="primary" onClick={nextStep}>
                        Next <ArrowRight className="w-4 h-4" />
                      </GlassButton>
                    ) : (
                      <GlassButton variant="primary" loading={submitting} onClick={onSubmit}>
                        <Send className="w-4 h-4" />
                        {available ? 'Submit Request' : 'Join Waitlist'}
                      </GlassButton>
                    )}
                  </div>
                </GlassCard>
              )}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <SectionTitle tag="FAQ" title="Frequently Asked Questions" className="mb-10" />
            <div className="max-w-2xl mx-auto space-y-3">
              {faqItems.map((item, i) => (
                <motion.div key={i} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  initial="hidden" whileInView="visible" viewport={{once: true}} transition={{delay: i * 0.05}}>
                  <GlassCard className="overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left"
                      aria-expanded={openFaq === i}
                    >
                      <span className="text-white font-medium text-sm pr-4">{item.q}</span>
                      <motion.span animate={{rotate: openFaq === i ? 45 : 0}} className="text-purple-400 shrink-0 text-xl font-light">+</motion.span>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}} transition={{duration: 0.2}}>
                          <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/10 pt-3">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
