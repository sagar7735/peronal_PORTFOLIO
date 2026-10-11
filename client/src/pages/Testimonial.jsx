import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Star, Send, CheckCircle } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import GlassInput from '../components/ui/GlassInput'
import GlassTextarea from '../components/ui/GlassTextarea'
import FileDropzone from '../components/ui/FileDropzone'
import SectionTitle from '../components/ui/SectionTitle'
import { testimonialsApi } from '../services/publicApi'
import { fadeUp } from '../utils/animations'
import toast from 'react-hot-toast'

const schema = z.object({
  clientName: z.string().min(1, 'Name is required'),
  clientRole: z.string().optional(),
  company: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(10, 'Review is too short (min 10 characters)').max(2000),
})

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          className="transition-transform hover:scale-110"
        >
          <Star className={`w-8 h-8 transition-colors ${
            star <= (hovered || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
          }`} />
        </button>
      ))}
    </div>
  )
}

export default function Testimonial() {
  const [avatar, setAvatar] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5 },
  })

  const onSubmit = async (data) => {
    try {
      const fd = new FormData()
      fd.append('clientName', data.clientName)
      if (data.clientRole) fd.append('clientRole', data.clientRole)
      if (data.company) fd.append('company', data.company)
      fd.append('rating', String(data.rating))
      fd.append('message', data.message)
      fd.append('website', '') // honeypot
      if (avatar) fd.append('avatar', avatar)

      await testimonialsApi.submit(fd)
      setSubmitted(true)
    } catch (err) {
      toast.error(err.message || 'Failed to submit review. Please try again.')
    }
  }

  return (
    <>
      <Helmet>
        <title>Leave a Review — Sagar Kumar Jena</title>
        <meta name="description" content="Leave a review for Sagar Kumar Jena's freelance services." />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <SectionTitle tag="Reviews" title="Leave a Review" subtitle="Your feedback means a lot and helps others know what to expect." className="mb-12" />

          {submitted ? (
            <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}}>
              <GlassCard glow className="p-10 text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-white">Thank you!</h2>
                <p className="text-gray-400">Your review has been submitted and is pending approval. I really appreciate your feedback!</p>
                <GlassButton variant="primary" onClick={() => { setSubmitted(false); reset(); setAvatar(null) }}>
                  Submit Another Review
                </GlassButton>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <GlassCard className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  <input type="text" className="hidden" tabIndex={-1} aria-hidden="true" {...register('website')} />

                  {/* Star Rating */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-3">Your Rating *</label>
                    <Controller
                      name="rating"
                      control={control}
                      render={({ field }) => <StarRating value={field.value} onChange={field.onChange} />}
                    />
                    {errors.rating && <p className="text-xs text-red-400 mt-1">{errors.rating.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <GlassInput label="Your Name *" placeholder="John Doe" error={errors.clientName?.message} {...register('clientName')} />
                    <GlassInput label="Your Role" placeholder="CEO, Designer, Developer..." {...register('clientRole')} />
                  </div>

                  <GlassInput label="Company" placeholder="Company or project name (optional)" {...register('company')} />

                  <GlassTextarea label="Your Review *" placeholder="Share your experience working with me — what went well, what you built together..." rows={5} error={errors.message?.message} {...register('message')} />

                  <FileDropzone
                    label="Your Photo (optional)"
                    accept="image/jpeg,image/png,image/webp"
                    maxSizeMB={5}
                    value={avatar}
                    onChange={setAvatar}
                  />

                  <GlassButton type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
                    <Send className="w-4 h-4" /> Submit Review
                  </GlassButton>
                  <p className="text-xs text-gray-500 text-center">Reviews are reviewed before publishing. Usually approved within 24 hours.</p>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
