import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex dark:bg-dark-950">
      {/* Left branding side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-600 to-primary-800" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(92,124,250,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(132,94,247,0.4) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(116,143,252,0.3) 0%, transparent 50%)'
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
            AI-powered intelligent analytics that transform your data into actionable insights.
          </p>
          <div className="mt-8 flex items-center justify-center gap-8 text-white/60 text-sm">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">10x</span>
              <span>Faster Analysis</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">99%</span>
              <span>Accuracy</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">24/7</span>
              <span>AI Assistant</span>
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
              Welcome back
            </h2>
            <p className="text-dark-500 dark:text-dark-400">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-dark-300 dark:border-dark-600 text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-800"
                />
                <span className="text-sm text-dark-600 dark:text-dark-400">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-dark-500 dark:text-dark-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
