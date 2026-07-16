import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FiTarget,
  FiAlertTriangle,
  FiCheckCircle,
  FiArrowUp,
  FiArrowDown,
  FiArrowRight,
  FiMessageSquare,
  FiLoader,
  FiAlertCircle,
  FiZap,
  FiTrendingUp,
  FiPieChart,
} from 'react-icons/fi'
import api from '../utils/api'

function ScoreCircle({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  let color = 'text-green-400'
  let strokeColor = '#4ade80'
  if (score < 40) {
    color = 'text-red-400'
    strokeColor = '#f87171'
  } else if (score < 70) {
    color = 'text-orange-400'
    strokeColor = '#fb923c'
  }

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-dark-200 dark:text-dark-700"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
        <span className="text-xs text-dark-400 dark:text-dark-500">%</span>
      </div>
    </div>
  )
}

function PriorityCard({ rec, index }) {
  const priority = (rec.priority || rec.level || 'medium').toLowerCase()
  let borderColor = 'border-orange-400'
  let bgGlow = 'from-orange-500/5'
  let badge = 'bg-orange-500/10 text-orange-400'
  let icon = <FiAlertTriangle className="w-4 h-4" />

  if (priority === 'high' || priority === 'critical') {
    borderColor = 'border-red-400'
    bgGlow = 'from-red-500/5'
    badge = 'bg-red-500/10 text-red-400'
    icon = <FiAlertCircle className="w-4 h-4" />
  } else if (priority === 'low') {
    borderColor = 'border-green-400'
    bgGlow = 'from-green-500/5'
    badge = 'bg-green-500/10 text-green-400'
    icon = <FiCheckCircle className="w-4 h-4" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass-card p-5 border-l-4 ${borderColor}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg ${badge}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-dark-900 dark:text-white text-sm">
              {rec.title || rec.name || 'Recommendation'}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>
              {priority}
            </span>
          </div>
          <p className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">
            {rec.description || rec.text || rec.content || ''}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function ActionItem({ item, index }) {
  const [checked, setChecked] = useState(item.completed || item.done || false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
    >
      <button
        onClick={() => setChecked(!checked)}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
          checked
            ? 'bg-primary-500 border-primary-500'
            : 'border-dark-300 dark:border-dark-600 hover:border-primary-400'
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span
        className={`text-sm leading-relaxed transition-colors ${
          checked
            ? 'text-dark-400 dark:text-dark-500 line-through'
            : 'text-dark-700 dark:text-dark-300'
        }`}
      >
        {item.text || item.description || item.action || item}
      </span>
    </motion.div>
  )
}

function PredictionCard({ pred, index }) {
  const trend = (pred.trend || pred.direction || 'stable').toLowerCase()
  let TrendIcon = FiArrowRight
  let trendColor = 'text-dark-400'

  if (trend === 'up' || trend === 'increasing' || trend === 'positive') {
    TrendIcon = FiArrowUp
    trendColor = 'text-green-400'
  } else if (trend === 'down' || trend === 'decreasing' || trend === 'negative') {
    TrendIcon = FiArrowDown
    trendColor = 'text-red-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-dark-900 dark:text-white text-sm mb-1">
            {pred.title || pred.name || pred.metric || 'Prediction'}
          </h4>
          <p className="text-sm text-dark-600 dark:text-dark-400">
            {pred.description || pred.text || pred.details || ''}
          </p>
          {pred.value && (
            <p className="text-lg font-bold text-dark-900 dark:text-white mt-2">
              {pred.value}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-xl bg-dark-50 dark:bg-dark-800 ${trendColor}`}>
          <TrendIcon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  )
}

function WeakAreaBar({ area, index }) {
  const severity = area.severity || area.score || area.percentage || 0
  let barColor = 'bg-green-500'
  let textColor = 'text-green-400'

  if (severity > 70) {
    barColor = 'bg-red-500'
    textColor = 'text-red-400'
  } else if (severity > 40) {
    barColor = 'bg-orange-500'
    textColor = 'text-orange-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
          {area.name || area.area || area.title || 'Area'}
        </span>
        <span className={`text-sm font-semibold ${textColor}`}>
          {severity}%
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-dark-200 dark:bg-dark-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${severity}%` }}
          transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
      {area.description && (
        <p className="text-xs text-dark-400 dark:text-dark-500">{area.description}</p>
      )}
    </motion.div>
  )
}

function NoFileSelected() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center mx-auto mb-6 border border-dark-200 dark:border-dark-700">
          <FiTarget className="w-10 h-10 text-dark-300 dark:text-dark-600" />
        </div>
        <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
          No file selected
        </h2>
        <p className="text-dark-500 dark:text-dark-400">
          Please select a file to view recommendations.
        </p>
      </motion.div>
    </div>
  )
}

export default function Recommendations() {
  const { fileId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (fileId) {
      fetchRecommendations()
    } else {
      setLoading(false)
    }
  }, [fileId])

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get(`/recommendations/${fileId}`)
      setData(res)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recommendations')
      toast.error('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  if (!fileId) return <NoFileSelected />

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-500 dark:text-dark-400">Analyzing your data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center glass-card p-8 max-w-md"
        >
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-dark-500 dark:text-dark-400 mb-6">{error}</p>
          <button onClick={fetchRecommendations} className="btn-primary">
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  const score = data?.overallScore || data?.overall_score || data?.score || 0
  const priorityRecs = data?.priorityRecommendations || data?.priority_recommendations || data?.recommendations || []
  const actionItems = data?.actionItems || data?.action_items || data?.actions || []
  const predictions = data?.predictions || []
  const weakAreas = data?.weakAreas || data?.weak_areas || data?.areas || []

  return (
    <div className="min-h-screen pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center gap-6 mb-10"
      >
        <ScoreCircle score={score} />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">
            Recommendations
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            AI-powered insights and action items for your data
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/chat/${fileId}`)}
          className="btn-primary flex items-center gap-2 shrink-0"
        >
          <FiMessageSquare className="w-4 h-4" />
          Chat About This
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <FiAlertTriangle className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-bold text-dark-900 dark:text-white">
              Priority Recommendations
            </h2>
          </div>
          {priorityRecs.length > 0 ? (
            <div className="space-y-3">
              {priorityRecs.map((rec, i) => (
                <PriorityCard key={i} rec={rec} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-dark-400 dark:text-dark-500 glass-card p-4">
              No priority recommendations at this time.
            </p>
          )}
        </motion.div>

        {/* Action Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <FiCheckCircle className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-bold text-dark-900 dark:text-white">
              Action Items
            </h2>
          </div>
          {actionItems.length > 0 ? (
            <div className="glass-card divide-y divide-dark-100 dark:divide-dark-700/50">
              {actionItems.map((item, i) => (
                <ActionItem key={i} item={item} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-dark-400 dark:text-dark-500 glass-card p-4">
              No action items at this time.
            </p>
          )}
        </motion.div>

        {/* Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-bold text-dark-900 dark:text-white">
              Predictions
            </h2>
          </div>
          {predictions.length > 0 ? (
            <div className="space-y-3">
              {predictions.map((pred, i) => (
                <PredictionCard key={i} pred={pred} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-dark-400 dark:text-dark-500 glass-card p-4">
              No predictions available.
            </p>
          )}
        </motion.div>

        {/* Weak Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <FiPieChart className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-bold text-dark-900 dark:text-white">
              Weak Areas
            </h2>
          </div>
          {weakAreas.length > 0 ? (
            <div className="glass-card p-5 space-y-5">
              {weakAreas.map((area, i) => (
                <WeakAreaBar key={i} area={area} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-dark-400 dark:text-dark-500 glass-card p-4">
              No weak areas identified.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
