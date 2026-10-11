import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import GlassInput from '../components/ui/GlassInput'
import GlassTextarea from '../components/ui/GlassTextarea'
import SectionTitle from '../components/ui/SectionTitle'
import { useApi } from '../hooks/useApi'
import { profileApi, contactApi } from '../services/publicApi'
import { fadeUp } from '../utils/animations'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message is too short (min 10 characters)'),
})

export default function Contact() {
  const { data: profile } = useApi(profileApi.get)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await contactApi.send(data)
      toast.success("Message sent! I'll get back to you soon.")
      reset()
    } catch (err) {
      toast.error(err.message || 'Failed to send. Please try again.')
    }
  }

  const contactInfo = [
    { icon: Mail, label: 'Email', value: profile?.email || 'jenasagar030@gmail.com', href: `mailto:${profile?.email || 'jenasagar030@gmail.com'}` },
    { icon: Phone, label: 'Phone / WhatsApp', value: `+91 ${profile?.phone || '7735802848'}`, href: `https://wa.me/91${profile?.whatsapp || '7735802848'}` },
    { icon: MapPin, label: 'Location', value: profile?.location || 'Bangalore, India', href: null },
  ]

  const socials = [
    { icon: Github, label: 'GitHub', href: profile?.socialLinks?.github },
    { icon: Linkedin, label: 'LinkedIn', href: profile?.socialLinks?.linkedin },
  ].filter(s => s.href)

  return (
    <>
      <Helmet>
        <title>Contact — Sagar Kumar Jena</title>
        <meta name="description" content="Get in touch with Sagar Kumar Jena for projects, collaborations, or just to say hi." />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionTitle tag="Contact" title="Get In Touch" subtitle="Have a project in mind or just want to chat? I'd love to hear from you." className="mb-14" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left info */}
            <div className="lg:col-span-2 space-y-5">
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <motion.div key={label} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once: true}}>
                  <GlassCard hover className="p-5 flex items-center gap-4">
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

              {socials.length > 0 && (
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once: true}}>
                  <GlassCard className="p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Find me on</p>
                    <div className="flex gap-3">
                      {socials.map(({ icon: Icon, label, href }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm">
                          <Icon className="w-4 h-4" />{label}
                        </a>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once: true}}>
                <GlassCard className="p-5 bg-gradient-to-br from-purple-600/10 to-blue-600/10">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    I typically respond within <span className="text-white font-semibold">24 hours</span>. For urgent matters, reach me on WhatsApp at{' '}
                    <a href="https://wa.me/917735802848" className="text-purple-400 hover:underline">+91 7735802848</a>.
                  </p>
                </GlassCard>
              </motion.div>
            </div>

            {/* Form */}
            <motion.div className="lg:col-span-3" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once: true}}>
              <GlassCard className="p-8">
                <h2 className="font-heading text-xl font-bold text-white mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <input type="text" className="hidden" tabIndex={-1} aria-hidden="true" {...register('website')} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <GlassInput label="Your Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
                    <GlassInput label="Email Address" type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} />
                  </div>
                  <GlassInput label="Subject" placeholder="Project inquiry, collaboration, say hi..." error={errors.subject?.message} {...register('subject')} />
                  <GlassTextarea label="Message" placeholder="Tell me more..." rows={6} error={errors.message?.message} {...register('message')} />
                  <GlassButton type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
                    <Send className="w-4 h-4" /> Send Message
                  </GlassButton>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
