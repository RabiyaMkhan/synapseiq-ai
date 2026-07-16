import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import {
  FiSend,
  FiMessageSquare,
  FiFile,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiFolder,
  FiTrash2,
} from 'react-icons/fi'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-400"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function WelcomeMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full text-center px-4"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/25">
        <FiMessageSquare className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">
        Hello! I'm your AI data assistant.
      </h2>
      <p className="text-dark-500 dark:text-dark-400 max-w-md">
        Ask me anything about your data. I can help you understand patterns, trends, anomalies, and more.
      </p>
    </motion.div>
  )
}

function FileSelector({ onSelect }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data } = await api.get('/files')
        setFiles(data.files || data || [])
      } catch {
        toast.error('Failed to load files')
      } finally {
        setLoading(false)
      }
    }
    fetchFiles()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center mb-6 border border-dark-200 dark:border-dark-700">
        <FiFolder className="w-8 h-8 text-primary-400" />
      </div>
      <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
        Select a file to chat about
      </h2>
      <p className="text-dark-500 dark:text-dark-400 mb-6">
        Choose a dataset to start your AI-powered conversation.
      </p>
      {loading ? (
        <div className="flex items-center gap-2 text-dark-400">
          <FiLoader className="w-5 h-5 animate-spin" />
          Loading files...
        </div>
      ) : files.length === 0 ? (
        <p className="text-dark-400 dark:text-dark-500">
          No files uploaded yet. Upload a file first to start chatting.
        </p>
      ) : (
        <div className="w-full max-w-lg space-y-2">
          {files.map((file) => (
            <motion.button
              key={file._id || file.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(file._id || file.id)}
              className="w-full flex items-center gap-3 p-4 glass-card hover:bg-primary-500/5 transition-colors text-left"
            >
              <FiFile className="w-5 h-5 text-primary-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-dark-900 dark:text-white truncate">
                  {file.originalName || file.name || file.filename}
                </p>
                {file.createdAt && (
                  <p className="text-xs text-dark-400 dark:text-dark-500">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <FiChevronRight className="w-4 h-4 text-dark-400 shrink-0" />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function Chat() {
  const { fileId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  useEffect(() => {
    if (fileId) {
      loadHistory()
    }
  }, [fileId])

  useEffect(() => {
    loadConversations()
  }, [])

  const loadHistory = async () => {
    try {
      const { data } = await api.get(`/chat/${fileId}/history`)
      const history = data.messages || data || []
      setMessages(Array.isArray(history) ? history : [])
    } catch {
      setMessages([])
    }
  }

  const loadConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations')
      setConversations(data.conversations || data || [])
    } catch {
      setConversations([])
    }
  }

  const handleDeleteConversation = async (chatId, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/chat/${chatId}`)
      setConversations(prev => prev.filter(c => c._id !== chatId))
      toast.success('Conversation deleted')
      if (fileId) {
        const deleted = conversations.find(c => c._id === chatId)
        if (deleted) {
          const convFileId = typeof deleted.fileId === 'object' ? deleted.fileId?._id : deleted.fileId
          if (convFileId === fileId) {
            setMessages([])
            navigate('/dashboard/chat')
          }
        }
      }
    } catch {
      toast.error('Failed to delete conversation')
    }
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading || !fileId) return

    const userMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post(`/chat/${fileId}`, { message: trimmed })
      const assistantMessage = {
        role: 'assistant',
        content: data.response || data.message || data.content || '',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get response')
      setMessages((prev) => prev.filter((m) => m !== userMessage))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (id) => {
    navigate(`/dashboard/chat/${id}`)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-dark-950">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="hidden lg:flex flex-col border-r border-dark-200 dark:border-dark-800 bg-dark-50 dark:bg-dark-900 overflow-hidden shrink-0"
          >
            <div className="p-4 border-b border-dark-200 dark:border-dark-800">
              <h3 className="text-sm font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Conversations
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-dark-400 dark:text-dark-500 text-center py-4 px-2">
                  No conversations yet
                </p>
              ) : (
                conversations.map((conv) => {
                  const convFileId = typeof conv.fileId === 'object' ? conv.fileId?._id : conv.fileId
                  const convFileName = typeof conv.fileId === 'object' ? conv.fileId?.originalName : conv.fileName
                  return (
                  <div
                    key={conv._id || conv.id}
                    className={`group flex items-center gap-1 rounded-xl transition-colors ${
                      convFileId === fileId
                        ? 'bg-primary-500/10'
                        : 'hover:bg-dark-100 dark:hover:bg-dark-800'
                    }`}
                  >
                  <button
                    onClick={() => handleFileSelect(convFileId)}
                    className="flex-1 flex items-center gap-3 p-3 rounded-xl text-left transition-colors min-w-0"
                  >
                    <FiMessageSquare className="w-4 h-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${convFileId === fileId ? 'text-primary-600 dark:text-primary-400' : 'text-dark-700 dark:text-dark-300'}`}>
                        {convFileName || conv.title || 'Chat'}
                      </p>
                      <p className="text-xs text-dark-400 dark:text-dark-500 flex items-center gap-1 mt-0.5">
                        <FiClock className="w-3 h-3" />
                        {formatDate(conv.updatedAt || conv.updated_at || conv.createdAt)}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(conv._id, e)}
                    className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0 mr-1"
                    title="Delete conversation"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                  </div>
                  )
                })
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-12 items-center justify-center bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-r-lg hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
        style={{ left: sidebarOpen ? 280 : 0 }}
      >
        {sidebarOpen ? (
          <FiChevronLeft className="w-4 h-4 text-dark-500" />
        ) : (
          <FiChevronRight className="w-4 h-4 text-dark-500" />
        )}
      </button>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!fileId ? (
          <FileSelector onSelect={handleFileSelect} />
        ) : (
          <>
            {/* Chat header */}
            <div className="shrink-0 px-6 py-4 border-b border-dark-200 dark:border-dark-800 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <FiMessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-dark-900 dark:text-white">
                    AI Data Assistant
                  </h1>
                  <p className="text-xs text-dark-400 dark:text-dark-500">
                    Ask anything about your data
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
              {messages.length === 0 && !loading && <WelcomeMessage />}

              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'glass rounded-bl-md'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:bg-dark-900 prose-pre:border prose-pre:border-dark-700 prose-code:text-primary-400 prose-code:before:content-none prose-code:after:content-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="shrink-0 border-t border-dark-200 dark:border-dark-800 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl p-4">
              <div className="flex items-end gap-3 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your data..."
                    disabled={loading}
                    rows={1}
                    className="w-full resize-none rounded-xl bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 px-4 py-3 pr-12 text-sm text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 disabled:opacity-50"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                    }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loading ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    <FiSend className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
