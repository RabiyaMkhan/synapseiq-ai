import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' }
  if (score <= 3) return { label: 'Medium', color: 'bg-yellow-500', width: 'w-2/3' }
  return { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
}

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const strength = useMemo(() => getPasswordStrength(password), [password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (!agreed) {
      toast.error('Please agree to the Terms and Conditions')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex dark:bg-dark-950">
      {/* Left branding side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-primary-600 to-accent-800" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(132,94,247,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(92,124,250,0.4) 0%, transparent 50%), radial-gradient(circle at 50% 10%, rgba(116,143,252,0.3) 0%, transparent 50%)'
        }} />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
        <motion.div
          className="relative z-10 text-center px-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <FiZap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">
            SynapseIQ
          </h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-md mx-auto">
            Join thousands of teams already using AI to unlock the full potential of their data.
          </p>
          <div className="mt-8 flex items-center justify-center gap-8 text-white/60 text-sm">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">5K+</span>
              <span>Active Users</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">50M+</span>
              <span>Files Analyzed</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">4.9/5</span>
              <span>User Rating</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 dark:bg-dark-950">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <FiZap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold gradient-text">SynapseIQ</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-dark-900 dark:text-white mb-2">
              Create your account
            </h2>
            <p className="text-dark-500 dark:text-dark-400">
              Start your AI-powered analytics journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 dark:text-dark-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-12"
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 dark:text-dark-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 dark:text-dark-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="h-1.5 flex-1 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} ${strength.width} rounded-full transition-all duration-300`} />
                    </div>
                    <span className={`text-xs ml-3 font-medium ${
                      strength.label === 'Weak' ? 'text-red-500' :
                      strength.label === 'Medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 dark:text-dark-500" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                >
                  {showConfirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-dark-300 dark:border-dark-600 text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-800"
              />
              <span className="text-sm text-dark-600 dark:text-dark-400">
                I agree to the{' '}
                <span className="text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-dark-500 dark:text-dark-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
