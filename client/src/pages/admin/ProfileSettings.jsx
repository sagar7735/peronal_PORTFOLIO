import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, User, Link as LinkIcon, BarChart2 } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import GlassButton from '../../components/ui/GlassButton'
import GlassInput from '../../components/ui/GlassInput'
import GlassTextarea from '../../components/ui/GlassTextarea'
import FileDropzone from '../../components/ui/FileDropzone'
import Skeleton from '../../components/ui/Skeleton'
import { useApi } from '../../hooks/useApi'
import { profileApi } from '../../services/publicApi'
import { adminProfileApi } from '../../services/adminApi'
import { getImageUrl } from '../../utils/getImageUrl'
import { fadeUp } from '../../utils/animations'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().optional(),
  bio: z.string().optional(),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0).max(50).optional(),
  location: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  availableForFreelance: z.boolean().optional(),
})

export default function ProfileSettings() {
  const { data: profile, loading, refetch } = useApi(profileApi.get)
  const [avatar, setAvatar] = useState(null)
  const [resume, setResume] = useState(null)
  const [stats, setStats] = useState([])
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const availableForFreelance = watch('availableForFreelance')

  useEffect(() => {
    if (!profile) return
    reset({
      name: profile.name || '',
      title: profile.title || '',
      tagline: profile.tagline || '',
      bio: profile.bio || '',
      currentCompany: profile.currentCompany || '',
      currentRole: profile.currentRole || '',
      yearsOfExperience: profile.yearsOfExperience || 0,
      location: profile.location || '',
      email: profile.email || '',
      phone: profile.phone || '',
      whatsapp: profile.whatsapp || '',
      github: profile.socialLinks?.github || '',
      linkedin: profile.socialLinks?.linkedin || '',
      twitter: profile.socialLinks?.twitter || '',
      instagram: profile.socialLinks?.instagram || '',
      availableForFreelance: profile.availableForFreelance ?? true,
    })
    setStats(profile.stats || [])
  }, [profile, reset])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('title', data.title)
      if (data.tagline) fd.append('tagline', data.tagline)
      if (data.bio) fd.append('bio', data.bio)
      if (data.currentCompany) fd.append('currentCompany', data.currentCompany)
      if (data.currentRole) fd.append('currentRole', data.currentRole)
      fd.append('yearsOfExperience', String(data.yearsOfExperience || 0))
      if (data.location) fd.append('location', data.location)
      fd.append('email', data.email)
      if (data.phone) fd.append('phone', data.phone)
      if (data.whatsapp) fd.append('whatsapp', data.whatsapp)
      fd.append('availableForFreelance', String(data.availableForFreelance ?? true))
      fd.append('socialLinks', JSON.stringify({
        github: data.github || '',
        linkedin: data.linkedin || '',
        twitter: data.twitter || '',
        instagram: data.instagram || '',
      }))
      fd.append('stats', JSON.stringify(stats))
      if (avatar) fd.append('avatar', avatar)
      if (resume) fd.append('resume', resume)

      await adminProfileApi.update(fd)
      await refetch()
      setAvatar(null)
      setResume(null)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const addStat = () => setStats(s => [...s, { label: '', value: '' }])
  const removeStat = (i) => setStats(s => s.filter((_, j) => j !== i))
  const updateStat = (i, field, val) => setStats(s => s.map((item, j) => j === i ? { ...item, [field]: val } : item))

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  )

  return (
    <>
      <Helmet><title>Profile Settings — Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Update your public portfolio profile</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <GlassCard className="p-6 space-y-5">
                <h2 className="font-heading font-semibold text-white flex items-center gap-2"><User className="w-4 h-4 text-purple-400" /> Basic Info</h2>
                <GlassInput label="Full Name *" error={errors.name?.message} {...register('name')} />
                <GlassInput label="Title *" placeholder="Full Stack Developer" error={errors.title?.message} {...register('title')} />
                <GlassInput label="Tagline" placeholder="Building modern web & mobile experiences..." {...register('tagline')} />
                <GlassTextarea label="Bio" rows={4} {...register('bio')} />
                <div className="grid grid-cols-2 gap-3">
                  <GlassInput label="Current Company" {...register('currentCompany')} />
                  <GlassInput label="Current Role" {...register('currentRole')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <GlassInput label="Years of Experience" type="number" min="0" {...register('yearsOfExperience')} />
                  <GlassInput label="Location" {...register('location')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <GlassInput label="Email *" type="email" error={errors.email?.message} {...register('email')} />
                  <GlassInput label="Phone" {...register('phone')} />
                </div>
                <GlassInput label="WhatsApp Number" {...register('whatsapp')} />

                {/* Availability toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-sm text-gray-300">Available for Freelance</span>
                  <button type="button"
                    onClick={() => setValue('availableForFreelance', !availableForFreelance)}
                    className={`w-12 h-6 rounded-full transition-all relative ${availableForFreelance ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${availableForFreelance ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>
              </GlassCard>
            </motion.div>

            <div className="space-y-6">
              {/* Avatar & Resume */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <GlassCard className="p-6 space-y-4">
                  <h2 className="font-heading font-semibold text-white">Avatar & Resume</h2>
                  {profile?.avatar && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <img src={getImageUrl(profile.avatar)} alt="Current avatar" className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30" />
                      <div>
                        <p className="text-white text-sm font-medium">Current Avatar</p>
                        <p className="text-gray-500 text-xs">Upload new to replace</p>
                      </div>
                    </div>
                  )}
                  <FileDropzone label="New Avatar (image)" accept="image/jpeg,image/png,image/webp" maxSizeMB={5} value={avatar} onChange={setAvatar} />
                  {profile?.resumeUrl && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 text-sm">
                      <span className="text-gray-400">Current resume:</span>
                      <a href={getImageUrl(profile.resumeUrl)} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">View PDF</a>
                    </div>
                  )}
                  <FileDropzone label="New Resume (PDF only)" accept=".pdf,application/pdf" maxSizeMB={5} value={resume} onChange={setResume} />
                </GlassCard>
              </motion.div>

              {/* Social Links */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <GlassCard className="p-6 space-y-4">
                  <h2 className="font-heading font-semibold text-white flex items-center gap-2"><LinkIcon className="w-4 h-4 text-purple-400" /> Social Links</h2>
                  <GlassInput label="GitHub URL" placeholder="https://github.com/..." {...register('github')} />
                  <GlassInput label="LinkedIn URL" placeholder="https://linkedin.com/in/..." {...register('linkedin')} />
                  <GlassInput label="Twitter URL" {...register('twitter')} />
                  <GlassInput label="Instagram URL" {...register('instagram')} />
                </GlassCard>
              </motion.div>
            </div>
          </div>

          {/* Stats */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-white flex items-center gap-2"><BarChart2 className="w-4 h-4 text-purple-400" /> Stats</h2>
                <GlassButton type="button" variant="outline" size="sm" onClick={addStat}>+ Add Stat</GlassButton>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <input value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Label (e.g. Projects)" className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-600 border-b border-white/10 pb-1" />
                    <input value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="Value (e.g. 20+)" className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-600" />
                    <button type="button" onClick={() => removeStat(i)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <div className="flex justify-end">
            <GlassButton type="submit" variant="primary" size="lg" loading={saving}>
              <Save className="w-4 h-4" /> Save Profile
            </GlassButton>
          </div>
        </form>
      </div>
    </>
  )
}
