import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FiFileText,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiCalendar,
  FiFile,
  FiLoader,
  FiAlertCircle,
  FiX,
} from 'react-icons/fi'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-1/3" />
          <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded w-full" />
        <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded w-2/3" />
      </div>
    </div>
  )
}

function ReportContent({ report }) {
  const content = report.content || report

  const downloadAsText = () => {
    let text = `${report.title || 'Report'}\n${'='.repeat(50)}\n\n`

    if (content.executiveSummary || content.executive_summary) {
      text += `EXECUTIVE SUMMARY\n${'-'.repeat(30)}\n${content.executiveSummary || content.executive_summary}\n\n`
    }

    if (content.datasetInfo || content.dataset_info) {
      const info = content.datasetInfo || content.dataset_info
      text += `DATASET INFO\n${'-'.repeat(30)}\n`
      if (typeof info === 'object') {
        Object.entries(info).forEach(([key, val]) => {
          text += `${key}: ${val}\n`
        })
      } else {
        text += `${info}\n`
      }
      text += '\n'
    }

    if (content.statistics) {
      text += `STATISTICS\n${'-'.repeat(30)}\n`
      if (Array.isArray(content.statistics)) {
        content.statistics.forEach((stat) => {
          if (typeof stat === 'object') {
            text += `${stat.name || stat.metric || stat.label || ''}: ${stat.value || stat.count || ''}\n`
          } else {
            text += `${stat}\n`
          }
        })
      } else if (typeof content.statistics === 'object') {
        Object.entries(content.statistics).forEach(([key, val]) => {
          text += `${key}: ${val}\n`
        })
      }
      text += '\n'
    }

    if (content.patterns || content.patterns_found) {
      const patterns = content.patterns || content.patterns_found
      text += `PATTERNS\n${'-'.repeat(30)}\n`
      if (Array.isArray(patterns)) {
        patterns.forEach((p, i) => {
          text += `${i + 1}. ${typeof p === 'object' ? p.description || p.pattern || JSON.stringify(p) : p}\n`
        })
      }
      text += '\n'
    }

    if (content.recommendations) {
      text += `RECOMMENDATIONS\n${'-'.repeat(30)}\n`
      if (Array.isArray(content.recommendations)) {
        content.recommendations.forEach((r, i) => {
          text += `${i + 1}. ${typeof r === 'object' ? r.description || r.text || JSON.stringify(r) : r}\n`
        })
      }
      text += '\n'
    }

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(report.title || 'report').replace(/\s+/g, '_').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Report downloaded')
  }

  const renderList = (items, label) => {
    if (!items || (Array.isArray(items) && items.length === 0)) return null
    const list = Array.isArray(items) ? items : [items]
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider mb-3">
          {label}
        </h4>
        <ul className="space-y-2">
          {list.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-dark-700 dark:text-dark-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0" />
              {typeof item === 'object' ? (
                <span>{item.description || item.text || item.pattern || JSON.stringify(item)}</span>
              ) : (
                <span>{item}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="pt-4 pb-2 space-y-6">
        {(content.executiveSummary || content.executive_summary) && (
          <div>
            <h4 className="text-sm font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider mb-2">
              Executive Summary
            </h4>
            <p className="text-sm text-dark-700 dark:text-dark-300 leading-relaxed">
              {content.executiveSummary || content.executive_summary}
            </p>
          </div>
        )}

        {(content.datasetInfo || content.dataset_info) && (
          <div>
            <h4 className="text-sm font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider mb-2">
              Dataset Info
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(content.datasetInfo || content.dataset_info).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-dark-50 dark:bg-dark-800/50 rounded-lg px-3 py-2 border border-dark-100 dark:border-dark-700/50"
                >
                  <span className="text-xs text-dark-400 dark:text-dark-500 block">{key}</span>
                  <span className="text-sm font-medium text-dark-900 dark:text-white">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.statistics && (
          <div>
            <h4 className="text-sm font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider mb-2">
              Statistics
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-200 dark:border-dark-700">
                    <th className="text-left py-2 pr-4 text-dark-500 dark:text-dark-400 font-medium">Metric</th>
                    <th className="text-left py-2 text-dark-500 dark:text-dark-400 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(content.statistics) ? (
                    content.statistics.map((stat, i) => (
                      <tr key={i} className="border-b border-dark-100 dark:border-dark-800">
                        <td className="py-2 pr-4 text-dark-700 dark:text-dark-300">
                          {typeof stat === 'object' ? stat.name || stat.metric || stat.label || '-' : '-'}
                        </td>
                        <td className="py-2 font-medium text-dark-900 dark:text-white">
                          {typeof stat === 'object' ? String(stat.value || stat.count || '-') : String(stat)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    Object.entries(content.statistics).map(([key, val]) => (
                      <tr key={key} className="border-b border-dark-100 dark:border-dark-800">
                        <td className="py-2 pr-4 text-dark-700 dark:text-dark-300">{key}</td>
                        <td className="py-2 font-medium text-dark-900 dark:text-white">{String(val)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {renderList(content.patterns || content.patterns_found, 'Patterns')}
        {renderList(content.recommendations, 'Recommendations')}

        <div className="pt-2">
          <button
            onClick={downloadAsText}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-sm font-medium text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Download as Text
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function Reports() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadReports()
    loadFiles()
  }, [])

  const loadReports = async () => {
    try {
      const { data } = await api.get('/reports')
      setReports(data.reports || data || [])
    } catch {
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const loadFiles = async () => {
    try {
      const { data } = await api.get('/files')
      setFiles(data.files || data || [])
    } catch {
      setFiles([])
    }
  }

  const handleGenerate = async (fileId) => {
    setGenerating(true)
    setShowModal(false)
    try {
      await api.post(`/reports/${fileId}`)
      toast.success('Report generated successfully!')
      await loadReports()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return
    setDeletingId(reportId)
    try {
      await api.delete(`/reports/${reportId}`)
      setReports((prev) => prev.filter((r) => (r._id || r.id) !== reportId))
      toast.success('Report deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete report')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-[50vh] pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Your Reports</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            AI-generated insights from your datasets
          </p>
        </div>
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(!showModal)}
            disabled={files.length === 0 || generating}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={files.length === 0 ? 'Upload a file first' : ''}
          >
            {generating ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FiPlus className="w-4 h-4" />
                Generate New Report
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {showModal && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 glass-card p-2 z-50"
              >
                <div className="flex items-center justify-between px-3 py-2 mb-1">
                  <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                    Select a file
                  </span>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-dark-400 hover:text-dark-600 dark:hover:text-dark-300"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {files.map((file) => (
                    <button
                      key={file._id || file.id}
                      onClick={() => handleGenerate(file._id || file.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary-500/5 transition-colors text-left"
                    >
                      <FiFile className="w-4 h-4 text-primary-400 shrink-0" />
                      <span className="text-sm text-dark-700 dark:text-dark-300 truncate">
                        {file.originalName || file.name || file.filename}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Reports list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-20 h-20 rounded-2xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center mb-6 border border-dark-200 dark:border-dark-700">
            <FiFileText className="w-10 h-10 text-dark-300 dark:text-dark-600" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
            No reports yet
          </h3>
          <p className="text-dark-500 dark:text-dark-400 text-center max-w-sm">
            Upload data and generate your first report!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, idx) => {
            const id = report._id || report.id
            const isExpanded = expandedId === id
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center shrink-0 border border-primary-500/10">
                    <FiFileText className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-dark-900 dark:text-white truncate">
                      {report.title || 'Untitled Report'}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-dark-400 dark:text-dark-500">
                      {report.fileId && typeof report.fileId === 'object' && report.fileId.originalName && (
                        <span className="flex items-center gap-1">
                          <FiFile className="w-3 h-3" />
                          {report.fileId.originalName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleExpand(id)}
                      className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                    >
                      {isExpanded ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(id)}
                      disabled={deletingId === id}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deletingId === id ? (
                        <FiLoader className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiTrash2 className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <ReportContent report={report} />
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
