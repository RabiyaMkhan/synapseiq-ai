import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud,
  FiFile,
  FiFileText,
  FiX,
  FiCheck,
  FiClock,
  FiArrowRight,
  FiMessageSquare,
  FiBarChart2,
  FiTrash2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ACCEPTED_TYPES = ['.csv', '.xlsx', '.xls', '.pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getFileTypeLabel(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'csv') return 'CSV';
  if (ext === 'xlsx' || ext === 'xls') return 'XLSX';
  if (ext === 'pdf') return 'PDF';
  return ext.toUpperCase();
}

function getFileTypeColor(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'csv') return 'from-green-400 to-emerald-500';
  if (ext === 'xlsx' || ext === 'xls') return 'from-blue-400 to-indigo-500';
  if (ext === 'pdf') return 'from-red-400 to-rose-500';
  return 'from-gray-400 to-slate-500';
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return <FiFileText className="w-5 h-5" />;
  return <FiFile className="w-5 h-5" />;
}

const typeBadgeColors = {
  CSV: 'bg-green-500/20 text-green-300 border-green-500/30',
  XLSX: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  PDF: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [recentUploads, setRecentUploads] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  const fetchRecentUploads = async () => {
    try {
      const res = await api.get('/files');
      const files = Array.isArray(res.data) ? res.data : res.data.files || [];
      setRecentUploads(files.slice(0, 5));
    } catch {
      setRecentUploads([]);
    }
  };

  const handleDeleteFile = async (fileId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/files/${fileId}`);
      setRecentUploads(prev => prev.filter(f => f._id !== fileId));
      toast.success('File deleted');
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const validateFile = useCallback((f) => {
    if (!f) return false;
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      toast.error('Unsupported file type. Please upload CSV, Excel, or PDF.');
      return false;
    }
    if (f.size > MAX_SIZE) {
      toast.error('File too large. Maximum size is 10MB.');
      return false;
    }
    return true;
  }, []);

  const handleFileSelect = useCallback(
    (e) => {
      const selected = e.target.files?.[0];
      if (selected && validateFile(selected)) {
        setFile(selected);
        setUploadedFile(null);
        setUploadProgress(0);
      }
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped && validateFile(dropped)) {
        setFile(dropped);
        setUploadedFile(null);
        setUploadProgress(0);
      }
    },
    [validateFile]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadedFile(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(pct);
        },
      });

      setUploadedFile(res.data.file || res.data);
      setUploadProgress(100);
      toast.success('File uploaded successfully!');
      fetchRecentUploads();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 lg:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Upload Your Data
          </h1>
          <p className="text-gray-400 text-lg">
            Support for CSV, Excel (XLSX), and PDF files
          </p>
        </div>

        <AnimatePresence mode="wait">
          {uploadedFile ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-10"
            >
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center"
                >
                  <FiCheck className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Upload Complete!
                </h2>
                <p className="text-gray-400 mb-8">
                  Your file has been processed and is ready for analysis.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      navigate(
                        `/dashboard/analysis/${
                          uploadedFile._id || uploadedFile.id
                        }`
                      )
                    }
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-shadow"
                  >
                    <FiBarChart2 className="w-5 h-5" />
                    View Analysis
                    <FiArrowRight className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      navigate(
                        `/dashboard/chat/${
                          uploadedFile._id || uploadedFile.id
                        }`
                      )
                    }
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-shadow"
                  >
                    <FiMessageSquare className="w-5 h-5" />
                    Start Chat
                    <FiArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative mb-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                  dragOver
                    ? 'border-purple-400 bg-purple-500/10 scale-[1.01]'
                    : file
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-gray-600/50 bg-gray-800/30 hover:border-purple-500/50 hover:bg-gray-800/50'
                }`}
              >
                <label className="flex flex-col items-center justify-center py-16 px-6 cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!file && (
                    <>
                      <motion.div
                        animate={
                          dragOver
                            ? { scale: 1.2, rotate: 5 }
                            : { scale: 1, rotate: 0 }
                        }
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="mb-5"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                          <FiUploadCloud className="w-8 h-8 text-purple-400" />
                        </div>
                      </motion.div>

                      <p className="text-white font-semibold text-lg mb-2">
                        Drag & drop your file here
                      </p>
                      <p className="text-gray-400 mb-5">
                        or{' '}
                        <span className="text-purple-400 font-medium underline underline-offset-2">
                          browse
                        </span>{' '}
                        to choose a file
                      </p>

                      <div className="flex gap-3">
                        {['CSV', 'XLSX', 'PDF'].map((type) => (
                          <span
                            key={type}
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${typeBadgeColors[type]}`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      <p className="text-gray-500 text-sm mt-4">
                        Maximum file size: 10MB
                      </p>
                    </>
                  )}

                  {file && !uploading && (
                    <div
                      className="flex items-center gap-4 w-full max-w-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getFileTypeColor(
                          file.name
                        )} flex items-center justify-center text-white flex-shrink-0`}
                      >
                        {getFileIcon(file.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {getFileTypeLabel(file.name)} &middot;{' '}
                          {formatSize(file.size)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </label>
              </div>

              {file && !uploading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all"
                  >
                    Upload & Analyze
                  </motion.button>
                </motion.div>
              )}

              {uploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-10"
                >
                  <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      <div>
                        <p className="text-white font-medium">
                          Uploading {file.name}...
                        </p>
                        <p className="text-gray-400 text-sm">
                          Please wait while we process your file
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-gray-400 text-sm text-right mt-2">
                      {uploadProgress}%
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {recentUploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
              <FiClock className="w-5 h-5 text-purple-400" />
              Recent Uploads
            </h2>
            <div className="space-y-3">
              {recentUploads.map((item, index) => (
                <motion.div
                  key={item._id || item.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getFileTypeColor(
                        item.originalName || item.name || 'file'
                      )} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      {getFileIcon(item.originalName || item.name || 'file')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate max-w-xs">
                        {item.originalName || item.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {getFileTypeLabel(item.originalName || item.name || 'file')} &middot;{' '}
                        {new Date(
                          item.createdAt || item.uploadDate
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        navigate(
                          `/dashboard/analysis/${item._id || item.id}`
                        )
                      }
                      className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors flex items-center gap-1.5"
                    >
                      <FiBarChart2 className="w-4 h-4" />
                      View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleDeleteFile(item._id, e)}
                      className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

