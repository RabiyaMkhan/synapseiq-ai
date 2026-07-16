import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiFileText, FiMessageSquare, FiHardDrive, FiUpload,
  FiFile, FiEye, FiArrowRight, FiBarChart2, FiTrash2
} from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const activityData = [
  { day: 'Mon', analyses: 4 }, { day: 'Tue', analyses: 7 },
  { day: 'Wed', analyses: 5 }, { day: 'Thu', analyses: 12 },
  { day: 'Fri', analyses: 8 }, { day: 'Sat', analyses: 3 },
  { day: 'Sun', analyses: 6 },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function formatStorage(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalFiles: 0, totalReports: 0, totalConversations: 0, totalStorage: 0, fileTypes: {} });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/user/stats').catch(() => ({ data: {} })),
      api.get('/files').catch(() => ({ data: [] }))
    ]).then(([statsRes, filesRes]) => {
      setStats(statsRes.data);
      setFiles(Array.isArray(filesRes.data) ? filesRes.data.slice(0, 5) : []);
    }).finally(() => setLoading(false));
  }, []);

  const handleDeleteFile = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}`);
      setFiles(prev => prev.filter(f => f._id !== fileId));
      toast.success('File deleted');
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const fileTypeData = Object.entries(stats.fileTypes || {}).map(([name, count]) => ({ name: name.toUpperCase(), count }));

  const kpiCards = [
    { icon: FiFileText, label: 'Total Files', value: stats.totalFiles, color: 'from-blue-500 to-blue-600' },
    { icon: FiFile, label: 'Reports', value: stats.totalReports, color: 'from-purple-500 to-purple-600' },
    { icon: FiMessageSquare, label: 'Conversations', value: stats.totalConversations, color: 'from-green-500 to-green-600' },
    { icon: FiHardDrive, label: 'Storage Used', value: formatStorage(stats.totalStorage), color: 'from-orange-500 to-orange-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name || 'User'}</span>
          </h1>
          <p className="text-gray-400 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to="/dashboard/upload" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all">
          <FiUpload className="w-4 h-4" /> Upload File
        </Link>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <motion.div key={card.label} variants={item} className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5 text-primary-400" /> Analysis Activity
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ background: '#212529', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e6edf3' }} />
              <Line type="monotone" dataKey="analyses" stroke="#5c7cfa" strokeWidth={3} dot={{ fill: '#5c7cfa', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5 text-accent-400" /> File Types
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fileTypeData.length > 0 ? fileTypeData : [{ name: 'No Data', count: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ background: '#212529', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e6edf3' }} />
              <Bar dataKey="count" fill="#845ef7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-semibold">Recent Files</h3>
          {files.length > 0 && (
            <Link to="/dashboard/upload" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        {files.length === 0 ? (
          <div className="p-12 text-center">
            <FiFileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No files uploaded yet.</p>
            <Link to="/dashboard/upload" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors">
              <FiUpload className="w-4 h-4" /> Upload Your First Dataset
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Size</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium truncate max-w-[200px]">{file.originalName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-primary-600/15 text-primary-400 uppercase">
                        {file.fileType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatStorage(file.fileSize)}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(file.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/dashboard/analysis/${file._id}`} className="p-2 rounded-lg text-primary-400 hover:bg-primary-600/15 transition-colors inline-flex items-center gap-1 text-xs">
                          <FiEye className="w-3.5 h-3.5" /> View
                        </Link>
                        <button
                          onClick={() => handleDeleteFile(file._id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-600/15 transition-colors text-xs"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/dashboard/upload" className="glass rounded-2xl p-6 border border-white/5 hover:border-primary-500/30 transition-all group">
          <FiUpload className="w-8 h-8 text-primary-400 mb-3 group-hover:scale-110 transition-transform" />
          <h4 className="text-white font-semibold">Upload New File</h4>
          <p className="text-gray-400 text-sm mt-1">CSV, Excel, or PDF</p>
        </Link>
        <Link to="/dashboard/reports" className="glass rounded-2xl p-6 border border-white/5 hover:border-accent-500/30 transition-all group">
          <FiFileText className="w-8 h-8 text-accent-400 mb-3 group-hover:scale-110 transition-transform" />
          <h4 className="text-white font-semibold">View Reports</h4>
          <p className="text-gray-400 text-sm mt-1">Generated analysis reports</p>
        </Link>
      </div>
    </div>
  );
}
