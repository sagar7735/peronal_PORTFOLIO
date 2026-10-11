import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Code2, Lock } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import GlassButton from '../../components/ui/GlassButton'
import GlassInput from '../../components/ui/GlassInput'
import AnimatedBackground from '../../components/ui/AnimatedBackground'
import { useAuth } from '../../context/AuthContext'
import { scaleIn } from '../../utils/animations'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const { admin, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/admin/dashboard'

  // Redirect if already logged in
  useEffect(() => {
    if (admin) navigate(from, { replace: true })
  }, [admin, navigate, from])

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Invalid email or password' })
    }
  }

  return (
    <>
      <Helmet><title>Admin Login — Sagar Kumar Jena</title></Helmet>
      <AnimatedBackground />

      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div variants={scaleIn} initial="hidden" animate="visible" className="w-full max-w-md">
          <GlassCard className="p-8 sm:p-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-glow mb-4">
                <Code2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 text-sm mt-1">Sign in to manage your portfolio</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <GlassInput
                label="Email Address"
                type="email"
                placeholder="jenasagar030@gmail.com"
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />

              <div className="relative">
                <GlassInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 p-1 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Root error */}
              {errors.root && (
                <motion.div initial={{opacity: 0, y: -4}} animate={{opacity: 1, y: 0}}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <Lock className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{errors.root.message}</p>
                </motion.div>
              )}

              <GlassButton type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full mt-2">
                Sign In to Admin Panel
              </GlassButton>
            </form>

            <p className="text-center text-gray-600 text-xs mt-6">
              This panel is for admin use only.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </>
  )
}
