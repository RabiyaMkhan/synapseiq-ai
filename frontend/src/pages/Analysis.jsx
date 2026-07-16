import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiMessageSquare,
  FiFileText,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiCheckCircle,
  FiBarChart2,
  FiPieChart,
  FiList,
  FiTarget,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../utils/api';

const TABS = [
  { id: 'overview', label: 'Overview', icon: FiBarChart2 },
  { id: 'statistics', label: 'Statistics', icon: FiPieChart },
  { id: 'insights', label: 'Insights', icon: FiList },
  { id: 'recommendations', label: 'Recommendations', icon: FiTarget },
];

function getFileTypeBadge(name) {
  const ext = (name || '').split('.').pop().toLowerCase();
  if (ext === 'csv') return { label: 'CSV', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
  if (ext === 'xlsx' || ext === 'xls') return { label: 'XLSX', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  if (ext === 'pdf') return { label: 'PDF', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
  return { label: ext.toUpperCase(), color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
}

function getSeverityColor(severity) {
  switch ((severity || '').toLowerCase()) {
    case 'high':
    case 'critical':
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    case 'medium':
    case 'moderate':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'low':
    case 'minor':
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
}

function getPriorityColor(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'high':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'low':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
}

function CircularScore({ score, size = 120, strokeWidth = 8, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      {label && <p className="text-sm text-gray-400 mt-2">{label}</p>}
    </div>
  );
}

function MiniStat({ label, value, color = 'from-purple-500 to-blue-500' }) {
  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
        {value ?? 'N/A'}
      </p>
    </div>
  );
}

export default function Analysis() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [fileData, setFileData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const recommendationsRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [fileId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fileRes, analysisRes, recsRes] = await Promise.all([
        api.get(`/files/${fileId}`).catch(() => ({ data: null })),
        api.get(`/analysis/${fileId}`).catch(() => ({ data: null })),
        api.get(`/recommendations/${fileId}`).catch(() => ({ data: null })),
      ]);
      setFileData(fileRes.data);
      setAnalysis(analysisRes.data);
      setRecommendations(recsRes.data);
    } catch {
      toast.error('Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      await api.post(`/reports/${fileId}`);
      toast.success('Report generated successfully!');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const scrollToRecommendations = () => {
    setActiveTab('recommendations');
    setTimeout(() => {
      recommendationsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-400">Loading analysis...</p>
        </div>
      </div>
    );
  }

  const badge = getFileTypeBadge(fileData?.originalName || fileData?.name || '');

  const sampleData = fileData?.data || [];
  const fileHeaders = fileData?.headers || [];
  const fileInsights = fileData?.insights || {};

  const analysisStats = analysis?.statistics || {};
  const statsArray = Object.entries(analysisStats).map(([name, stats]) => ({
    name,
    mean: stats.mean,
    median: stats.median,
    min: stats.min,
    max: stats.max,
    stdDev: stats.stdDev,
  }));

  const barChartData = statsArray.map((col) => ({
    name: col.name,
    average: parseFloat((col.mean || 0).toFixed(2)),
    median: parseFloat((col.median || 0).toFixed(2)),
  }));

  const trends = analysis?.trends || [];
  const correlations = analysis?.correlations || [];
  const analysisAnomalies = analysis?.anomalies || [];

  const anomalyRows = analysisAnomalies.map((a) => ({
    column: a.column,
    value: a.value,
    type: a.type,
    severity: Math.abs(a.deviation) > 3 ? 'high' : Math.abs(a.deviation) > 2 ? 'medium' : 'low',
    description: `${a.type === 'high' ? 'Unusually high' : 'Unusually low'} value (${a.value}) in row ${a.row}, ${Math.abs(a.deviation).toFixed(1)} standard deviations from mean`,
  }));

  const dq = analysis?.dataQuality || fileInsights?.dataQuality || {};

  const recs = recommendations?.recommendations || [];
  const actionItems = recommendations?.actionItems || [];
  const predictions = recommendations?.predictions || [];
  const weakAreas = recommendations?.weakAreas || [];
  const overallScore = recommendations?.overallScore || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {fileData?.originalName || fileData?.name || 'Untitled File'}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              {fileData?.createdAt && (
                <p className="text-gray-400 text-sm">
                  Uploaded{' '}
                  {new Date(fileData.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/dashboard/chat/${fileId}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-pink-500/25 transition-shadow"
              >
                <FiMessageSquare className="w-4 h-4" />
                Chat with AI
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-shadow disabled:opacity-50"
              >
                {generatingReport ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiFileText className="w-4 h-4" />
                )}
                Generate Report
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToRecommendations}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-700/50 text-gray-300 border border-gray-600/50 rounded-xl font-medium text-sm hover:bg-gray-700 transition-colors"
              >
                <FiTarget className="w-4 h-4" />
                Get Recommendations
              </motion.button>
            </div>
          </div>

          <div className="flex gap-1 mb-8 bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-1.5 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-white border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 flex items-center justify-center">
                  <CircularScore score={dq.completeness || dq.dataQualityScore || fileInsights?.qualityScore || 0} label="Data Quality" />
                </div>
                <MiniStat label="Rows" value={analysis?.totalRows || sampleData.length} color="from-blue-400 to-cyan-400" />
                <MiniStat label="Columns" value={analysis?.totalColumns || fileHeaders.length} color="from-purple-400 to-pink-400" />
                <MiniStat label="Missing Values" value={fileInsights?.missingValues ?? dq.missingCells ?? 'N/A'} color="from-yellow-400 to-orange-400" />
                <MiniStat label="Duplicates" value={fileInsights?.duplicates ?? dq.duplicateRows ?? 'N/A'} color="from-red-400 to-rose-400" />
              </div>

              {sampleData.length > 0 && (
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-gray-700/30">
                    <h3 className="text-white font-semibold text-lg">Sample Data</h3>
                    <p className="text-gray-400 text-sm">First {Math.min(sampleData.length, 10)} rows</p>
                  </div>
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-700/30">
                          {(fileHeaders.length > 0 ? fileHeaders : Object.keys(sampleData[0] || {})).map((h, i) => (
                            <th key={i} className="px-4 py-3 text-left text-gray-300 font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sampleData.slice(0, 10).map((row, rowIdx) => (
                          <tr key={rowIdx} className={`border-t border-gray-700/20 ${rowIdx % 2 === 0 ? 'bg-transparent' : 'bg-gray-700/10'}`}>
                            {(fileHeaders.length > 0 ? fileHeaders : Object.keys(row)).map((h, colIdx) => (
                              <td key={colIdx} className="px-4 py-2.5 text-gray-300 whitespace-nowrap">
                                {row[h] !== undefined && row[h] !== null ? String(row[h]) : '\u2014'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'statistics' && (
            <motion.div key="statistics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {barChartData.length > 0 && (
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 mb-8">
                  <h3 className="text-white font-semibold text-lg mb-4">Column Averages Comparison</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} angle={-35} textAnchor="end" height={80} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                        <Bar dataKey="average" fill="#a855f7" radius={[4, 4, 0, 0]} name="Average" />
                        <Bar dataKey="median" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Median" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {statsArray.map((col, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-5">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <FiBarChart2 className="w-4 h-4 text-purple-400" />
                      {col.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Mean</p>
                        <p className="text-white font-medium">{col.mean != null ? Number(col.mean).toFixed(2) : 'N/A'}</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Median</p>
                        <p className="text-white font-medium">{col.median != null ? Number(col.median).toFixed(2) : 'N/A'}</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Min</p>
                        <p className="text-green-400 font-medium">{col.min != null ? Number(col.min).toFixed(2) : 'N/A'}</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Max</p>
                        <p className="text-red-400 font-medium">{col.max != null ? Number(col.max).toFixed(2) : 'N/A'}</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-3 col-span-2">
                        <p className="text-gray-400 text-xs">Std Dev</p>
                        <p className="text-blue-400 font-medium">
                          {col.stdDev != null ? Number(col.stdDev).toFixed(4) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {statsArray.length === 0 && (
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-12 text-center">
                  <FiBarChart2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No numeric column statistics available</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {trends.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <FiTrendingUp className="w-5 h-5 text-purple-400" />
                    Trends
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trends.map((trend, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                        className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-5">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            trend.direction === 'up' || trend.direction === 'increasing'
                              ? 'bg-green-500/20 text-green-400'
                              : trend.direction === 'down' || trend.direction === 'decreasing'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {trend.direction === 'up' || trend.direction === 'increasing'
                              ? <FiTrendingUp className="w-5 h-5" />
                              : trend.direction === 'down' || trend.direction === 'decreasing'
                              ? <FiTrendingDown className="w-5 h-5" />
                              : <FiBarChart2 className="w-5 h-5" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium mb-1">{trend.column || trend.name || trend.title}</p>
                            <p className="text-gray-400 text-sm">{trend.description || trend.summary || trend.insight}</p>
                            {trend.change && <p className="text-sm mt-2 font-medium text-purple-400">{trend.change}</p>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {correlations.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <FiBarChart2 className="w-5 h-5 text-blue-400" />
                    Correlations
                  </h3>
                  <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-700/30">
                            <th className="px-5 py-3 text-left text-gray-300 font-medium">Column Pair</th>
                            <th className="px-5 py-3 text-left text-gray-300 font-medium">Coefficient</th>
                            <th className="px-5 py-3 text-left text-gray-300 font-medium">Strength</th>
                          </tr>
                        </thead>
                        <tbody>
                          {correlations.map((corr, idx) => {
                            const coef = corr.coefficient ?? corr.value ?? corr.correlation ?? 0;
                            const absCoef = Math.abs(coef);
                            let strength = 'Weak';
                            let strengthColor = 'bg-gray-500/20 text-gray-300 border-gray-500/30';
                            if (absCoef >= 0.7) {
                              strength = 'Strong';
                              strengthColor = 'bg-green-500/20 text-green-300 border-green-500/30';
                            } else if (absCoef >= 0.4) {
                              strength = 'Moderate';
                              strengthColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
                            }
                            return (
                              <tr key={idx} className="border-t border-gray-700/20">
                                <td className="px-5 py-3 text-gray-300">
                                  {corr.column1 || corr.columns?.[0]} &harr; {corr.column2 || corr.columns?.[1]}
                                </td>
                                <td className="px-5 py-3 text-white font-medium">{Number(coef).toFixed(3)}</td>
                                <td className="px-5 py-3">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${strengthColor}`}>
                                    {strength}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {anomalyRows.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <FiAlertTriangle className="w-5 h-5 text-yellow-400" />
                    Anomalies
                  </h3>
                  <div className="space-y-3">
                    {anomalyRows.map((anomaly, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                        className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 flex items-start gap-4">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          (anomaly.severity || '').toLowerCase() === 'high' ? 'bg-red-500'
                            : (anomaly.severity || '').toLowerCase() === 'medium' ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="text-white font-medium">{anomaly.column || anomaly.field || anomaly.title}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(anomaly.severity)}`}>
                              {anomaly.severity || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{anomaly.description || anomaly.message || anomaly.detail}</p>
                          {anomaly.count && (
                            <p className="text-gray-500 text-xs mt-1">
                              {anomaly.count} occurrence{anomaly.count !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {trends.length === 0 && correlations.length === 0 && anomalyRows.length === 0 && (
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-12 text-center">
                  <FiList className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No insights available for this dataset</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div key="recommendations" ref={recommendationsRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {overallScore > 0 && (
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8 mb-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <CircularScore score={overallScore} size={150} strokeWidth={10} label="Overall Score" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Your Data Health Score</h3>
                      <p className="text-gray-400 mb-4">
                        {overallScore >= 70
                          ? 'Your data quality is good. Below are recommendations for optimization.'
                          : overallScore >= 40
                          ? 'Your data needs some improvement. Check the recommendations below.'
                          : 'Your data requires significant attention. Please review the recommendations carefully.'}
                      </p>
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-gray-400">Strong (70-100)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-gray-400">Moderate (40-69)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-gray-400">Weak (0-39)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {recs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white font-semibold text-lg mb-4">Priority Recommendations</h3>
                  <div className="space-y-4">
                    {recs.map((rec, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                        className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h4 className="text-white font-medium">{rec.title || rec.name || rec.recommendation}</h4>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                                {(rec.priority || 'medium').toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm">{rec.description || rec.detail || rec.explanation}</p>
                            {rec.impact && <p className="text-purple-400 text-xs mt-2 font-medium">Impact: {rec.impact}</p>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {actionItems.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white font-semibold text-lg mb-4">Action Items</h3>
                  <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-5">
                    <div className="space-y-3">
                      {actionItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-700/20 transition-colors">
                          <div className="mt-0.5 flex-shrink-0">
                            {item.completed || item.done
                              ? <FiCheckCircle className="w-5 h-5 text-green-400" />
                              : <div className="w-5 h-5 rounded border-2 border-gray-600" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${item.completed || item.done ? 'text-gray-400 line-through' : 'text-white'}`}>
                              {item.title || item.action || item.text}
                            </p>
                            {item.description && <p className="text-gray-400 text-sm mt-0.5">{item.description}</p>}
                          </div>
                          {item.priority && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {predictions.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white font-semibold text-lg mb-4">Predictions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predictions.map((pred, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.08 }}
                        className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
                            {(pred.direction === 'up' || pred.trend === 'up' || pred.trend === 'increasing')
                              ? <FiTrendingUp className="w-4 h-4 text-green-400" />
                              : (pred.direction === 'down' || pred.trend === 'down' || pred.trend === 'decreasing')
                              ? <FiTrendingDown className="w-4 h-4 text-red-400" />
                              : <FiBarChart2 className="w-4 h-4 text-blue-400" />
                            }
                          </div>
                          <h4 className="text-white font-medium">{pred.column || pred.name || pred.title}</h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{pred.description || pred.insight || pred.prediction}</p>
                        {pred.confidence && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Confidence:</span>
                            <div className="flex-1 bg-gray-700/50 rounded-full h-1.5">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${pred.confidence}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{pred.confidence}%</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {weakAreas.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold text-lg mb-4">Weak Areas</h3>
                  <div className="space-y-3">
                    {weakAreas.map((area, idx) => {
                      const severityVal = (area.severity || '').toLowerCase() === 'high' ? 90
                        : (area.severity || '').toLowerCase() === 'medium' ? 60 : 30;
                      return (
                        <motion.div key={idx} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                          className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium">{area.column || area.name || area.area}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(area.severity)}`}>
                              {area.severity || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{area.description || area.issue || area.detail}</p>
                          <div className="w-full bg-gray-700/50 rounded-full h-2">
                            <div className={`h-full rounded-full transition-all duration-1000 ${
                              severityVal >= 70 ? 'bg-gradient-to-r from-red-500 to-rose-500'
                                : severityVal >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`} style={{ width: `${severityVal}%` }} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {recs.length === 0 && actionItems.length === 0 && predictions.length === 0 && weakAreas.length === 0 && (
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-12 text-center">
                  <FiTarget className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No recommendations available. Click "Get Recommendations" to generate them.</p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
