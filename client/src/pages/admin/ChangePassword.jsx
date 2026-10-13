import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import GlassButton from '../../components/ui/GlassButton'
import GlassInput from '../../components/ui/GlassInput'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../services/adminApi'
import { fadeUp } from '../../utils/animations'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Min 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and a number'),
  confirmPassword: z.string().min(1, 'Please confirm password'),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export default function ChangePassword() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword, confirmPassword: data.confirmPassword })
      toast.success('Password changed! Please log in again.')
      reset()
      await logout()
      navigate('/admin/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    }
  }

  return (
    <>
      <Helmet><title>Change Password — Admin</title></Helmet>
      <div className="max-w-lg">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-white">Change Password</h1>
          <p className="text-gray-400 text-sm mt-1">Update your admin password. You'll be logged out after.</p>
        </div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <GlassCard className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="relative">
                <GlassInput label="Current Password" type={showCurrent ? 'text' : 'password'} error={errors.currentPassword?.message} {...register('currentPassword')} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-8 p-1 text-gray-400 hover:text-white">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <GlassInput label="New Password" type={showNew ? 'text' : 'password'} error={errors.newPassword?.message} {...register('newPassword')} />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-8 p-1 text-gray-400 hover:text-white">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <GlassInput label="Confirm New Password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
              <GlassButton type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
                <Lock className="w-4 h-4" /> Change Password
              </GlassButton>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </>
  )
}
