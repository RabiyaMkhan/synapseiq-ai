import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiSave,
  FiFile,
  FiFileText,
  FiMessageSquare,
  FiHardDrive,
  FiLock,
  FiTrash2,
  FiSun,
  FiMoon,
  FiUpload,
  FiLoader,
} from 'react-icons/fi'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function StatCard({ icon: Icon, label, value, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-dark-900 dark:text-white">{value}</p>
          <p className="text-sm text-dark-500 dark:text-dark-400">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function UserDashboard() {
  const { user } = useAuth()
  const { dark, toggle: toggleTheme } = useTheme()

  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [uploadHistory, setUploadHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [profileRes, statsRes, historyRes] = await Promise.allSettled([
        api.get('/user/profile'),
        api.get('/user/stats'),
        api.get('/user/upload-history'),
      ])

      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value.data.user || profileRes.value.data
        setProfile(p)
        setName(p.name || '')
        setEmail(p.email || '')
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.stats || statsRes.value.data)
      }

      if (historyRes.status === 'fulfilled') {
        setUploadHistory(historyRes.value.data.history || historyRes.value.data.uploads || historyRes.value.data || [])
      }
    } catch {
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      await api.put('/user/profile', { name: name.trim(), email: email.trim() })
      toast.success('Profile updated successfully')
      setProfile((prev) => ({ ...prev, name: name.trim(), email: email.trim() }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    toast.success('Password change functionality coming soon')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This action cannot be undone.')) return
    try {
      await api.delete('/user/account')
      toast.success('Account deleted')
      localStorage.removeItem('token')
      window.location.href = '/'
    } catch {
      toast.error('Failed to delete account')
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this file?')) return
    try {
      await api.delete(`/files/${fileId}`)
      setUploadHistory(prev => prev.filter(f => f._id !== fileId))
      toast.success('File deleted')
    } catch {
      toast.error('Failed to delete file')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-500 dark:text-dark-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { icon: FiFile, label: 'Files Uploaded', value: stats?.files || stats?.totalFiles || 0, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { icon: FiFileText, label: 'Reports Generated', value: stats?.reports || stats?.totalReports || 0, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { icon: FiMessageSquare, label: 'Conversations', value: stats?.conversations || stats?.totalConversations || 0, color: 'bg-gradient-to-br from-primary-500 to-primary-600' },
    { icon: FiHardDrive, label: 'Storage Used', value: stats?.storage || stats?.storageUsed || '0 MB', color: 'bg-gradient-to-br from-accent-500 to-accent-600' },
  ]

  return (
    <div className="min-h-screen pb-12 max-w-5xl mx-auto">
      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-8"
      >
        <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Profile</h2>
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <span className="text-3xl font-bold text-white">
                {getInitials(name || profile?.name)}
              </span>
            </div>
            <span className="text-xs text-dark-400 dark:text-dark-500 flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              Member since {formatDate(profile?.createdAt || profile?.created_at)}
            </span>
          </div>

          {/* Form */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 dark:text-dark-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Your name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 dark:text-dark-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <StatCard key={i} {...card} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Upload History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-8 mb-8"
      >
        <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Upload History</h2>
        {uploadHistory.length === 0 ? (
          <div className="text-center py-8">
            <FiUpload className="w-10 h-10 text-dark-300 dark:text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400 dark:text-dark-500">No uploads yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700">
                  <th className="text-left py-3 pr-4 text-dark-500 dark:text-dark-400 font-medium">File Name</th>
                  <th className="text-left py-3 pr-4 text-dark-500 dark:text-dark-400 font-medium">Size</th>
                  <th className="text-left py-3 pr-4 text-dark-500 dark:text-dark-400 font-medium">Type</th>
                  <th className="text-left py-3 pr-4 text-dark-500 dark:text-dark-400 font-medium">Date</th>
                  <th className="text-left py-3 text-dark-500 dark:text-dark-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadHistory.map((item, i) => (
                  <tr
                    key={item._id || item.id || i}
                    className="border-b border-dark-100 dark:border-dark-800 last:border-0"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <FiFile className="w-4 h-4 text-primary-400 shrink-0" />
                        <span className="text-dark-900 dark:text-white font-medium truncate">
                          {item.originalName || item.name || item.filename || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-dark-600 dark:text-dark-400">
                      {item.fileSize
                        ? item.fileSize > 1048576
                          ? `${(item.fileSize / 1048576).toFixed(1)} MB`
                          : `${(item.fileSize / 1024).toFixed(1)} KB`
                        : '-'}
                    </td>
                    <td className="py-3 pr-4 text-dark-600 dark:text-dark-400">
                      {item.fileType || '-'}
                    </td>
                    <td className="py-3 text-dark-600 dark:text-dark-400">
                      {formatDate(item.createdAt || item.created_at)}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDeleteFile(item._id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete file"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Account Settings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-8 mb-8"
      >
        <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Account Settings</h2>

        {/* Change Password */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
            <FiLock className="w-5 h-5 text-primary-400" />
            Change Password
          </h3>
          <div className="space-y-3 max-w-md">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
              placeholder="Current password"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="New password"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirm new password"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleChangePassword}
              className="btn-primary flex items-center gap-2"
            >
              <FiLock className="w-4 h-4" />
              Update Password
            </motion.button>
          </div>
        </div>

        {/* Delete Account */}
        <div className="pt-6 border-t border-dark-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-red-500 mb-2 flex items-center gap-2">
            <FiTrash2 className="w-5 h-5" />
            Delete Account
          </h3>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDeleteAccount}
            className="px-6 py-3 bg-red-500/10 text-red-500 font-semibold rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 active:scale-95 flex items-center gap-2"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete Account
          </motion.button>
        </div>
      </motion.div>

      {/* Preferences Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-8"
      >
        <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-100 dark:border-dark-700/50">
            <div className="flex items-center gap-3">
              {dark ? (
                <FiMoon className="w-5 h-5 text-primary-400" />
              ) : (
                <FiSun className="w-5 h-5 text-yellow-400" />
              )}
              <div>
                <p className="font-medium text-dark-900 dark:text-white">
                  {dark ? 'Dark Mode' : 'Light Mode'}
                </p>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Toggle between dark and light theme
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                dark
                  ? 'bg-primary-500'
                  : 'bg-dark-300 dark:bg-dark-600'
              }`}
            >
              <motion.div
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                animate={{ left: dark ? 32 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {dark ? (
                  <FiMoon className="w-3 h-3 text-primary-500" />
                ) : (
                  <FiSun className="w-3 h-3 text-yellow-500" />
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
