const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { reports, files } = require('../db');

router.get('/', auth, async (req, res) => {
  try {
    const userReports = await reports.find({ user: req.user._id }).sort({ createdAt: -1 });

    const enriched = [];
    for (const report of userReports) {
      const file = await files.findOne({ _id: report.fileId });
      enriched.push({
        ...report,
        fileId: file ? { _id: file._id, originalName: file.originalName, fileType: file.fileType } : report.fileId
      });
    }

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports', error: err.message });
  }
});

router.post('/:fileId', auth, async (req, res) => {
  try {
    const file = await files.findOne({ _id: req.params.fileId, user: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    const { title } = req.body;
    const reportContent = generateReport(file, title);

    const report = await reports.insert({
      user: req.user._id,
      fileId: file._id,
      title: title || `Report: ${file.originalName}`,
      content: reportContent,
      createdAt: new Date().toISOString()
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate report', error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const report = await reports.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const file = await files.findOne({ _id: report.fileId });
    const enriched = {
      ...report,
      fileId: file ? { _id: file._id, originalName: file.originalName, fileType: file.fileType, data: file.data, insights: file.insights } : report.fileId
    };

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get report', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await reports.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) return res.status(404).json({ message: 'Report not found' });

    await reports.remove({ _id: req.params.id });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete report', error: err.message });
  }
});

function generateReport(file, customTitle) {
  const data = Array.isArray(file.data) ? file.data : (file.data?.rows || []);
  const insights = file.insights || {};

  const numericStats = {};
  (insights.numericColumns || []).forEach(col => {
    const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    if (values.length === 0) return;
    numericStats[col] = {
      average: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      min: Math.min(...values),
      max: Math.max(...values),
      sum: values.reduce((a, b) => a + b, 0).toFixed(2)
    };
  });

  return {
    title: customTitle || `Analysis Report: ${file.originalName}`,
    executive: `This report provides an analysis of "${file.originalName}". The dataset contains ${data.length} records across ${insights.columns ? insights.columns.length : 0} columns. Key findings include ${insights.patterns ? insights.patterns.length : 0} identified patterns and a data quality score of ${insights.dataQuality && insights.dataQuality.completeness ? insights.dataQuality.completeness : 'N/A'}%.`,
    datasetInfo: {
      fileName: file.originalName,
      fileType: file.fileType,
      totalRows: data.length,
      totalColumns: insights.columns ? insights.columns.length : 0,
      columns: insights.columns || [],
      createdAt: file.createdAt
    },
    statistics: numericStats,
    patterns: insights.patterns || [],
    insights: {
      totalRecords: data.length,
      missingValues: insights.missingValues || 0,
      duplicateRows: insights.duplicates || 0,
      anomaliesDetected: insights.anomalies || 0,
      dataQuality: insights.dataQuality && insights.dataQuality.completeness ? insights.dataQuality.completeness : 'N/A'
    },
    recommendations: insights.recommendations || [],
    generatedAt: new Date(),
    generatedBy: 'SynapseIQ AI Analytics Engine'
  };
}

module.exports = router;
