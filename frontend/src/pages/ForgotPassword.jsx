import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiMail, FiZap, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSent(true)
      toast.success('Reset link sent to your email!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex dark:bg-dark-950">
      {/* Left branding side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-accent-600 to-primary-600" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 40% 30%, rgba(92,124,250,0.4) 0%, transparent 50%), radial-gradient(circle at 60% 70%, rgba(132,94,247,0.4) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(116,143,252,0.3) 0%, transparent 50%)'
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
            No worries, we'll help you get back into your account in no time.
          </p>
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
              Reset your password
            </h2>
            <p className="text-dark-500 dark:text-dark-400">
              Enter the email address associated with your account and we'll send a link to reset your password.
            </p>
          </div>

          {sent ? (
            <motion.div
              className="glass-card p-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-display font-semibold text-dark-900 dark:text-white mb-2">
                Check your email
              </h3>
              <p className="text-dark-500 dark:text-dark-400 mb-6">
                We've sent a password reset link to{' '}
                <span className="text-dark-700 dark:text-white font-medium">{email}</span>.
                Please check your inbox and follow the instructions.
              </p>
              <button
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
                className="btn-secondary w-full"
              >
                Didn't receive it? Try again
              </button>
            </motion.div>
          ) : (
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
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <p className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-white font-medium transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
