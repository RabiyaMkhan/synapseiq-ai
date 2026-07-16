const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { files } = require('../db');

router.get('/:fileId', auth, async (req, res) => {
  try {
    const file = await files.findOne({ _id: req.params.fileId, user: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    const analysis = generateDeepAnalysis(file);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: 'Analysis failed', error: err.message });
  }
});

router.get('/:fileId/summary', auth, async (req, res) => {
  try {
    const file = await files.findOne({ _id: req.params.fileId, user: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    res.json({
      summary: file.summary,
      insights: file.insights,
      fileName: file.originalName,
      fileType: file.fileType,
      createdAt: file.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get summary', error: err.message });
  }
});

function generateDeepAnalysis(file) {
  const data = Array.isArray(file.data) ? file.data : (file.data?.rows || []);
  const columns = file.insights?.columns || file.headers || [];
  const numericCols = file.insights?.numericColumns || [];

  const statistics = {};
  numericCols.forEach(col => {
    const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    if (values.length === 0) return;
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    statistics[col] = {
      count: values.length,
      mean: parseFloat(mean.toFixed(2)),
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      stdDev: parseFloat(Math.sqrt(variance).toFixed(2)),
      range: parseFloat((sorted[sorted.length - 1] - sorted[0]).toFixed(2))
    };
  });

  const trends = [];
  numericCols.forEach(col => {
    const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    if (values.length < 2) return;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const change = ((avgSecond - avgFirst) / avgFirst) * 100;
    trends.push({
      column: col,
      direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      changePercent: parseFloat(change.toFixed(2)),
      description: `${col} is ${change > 5 ? 'trending upward' : change < -5 ? 'trending downward' : 'relatively stable'} with ${Math.abs(change).toFixed(1)}% ${change > 0 ? 'growth' : 'decline'} over the dataset period`
    });
  });

  const correlations = [];
  for (let i = 0; i < numericCols.length; i++) {
    for (let j = i + 1; j < numericCols.length; j++) {
      const col1 = numericCols[i];
      const col2 = numericCols[j];
      const pairs = data
        .map(row => [parseFloat(row[col1]), parseFloat(row[col2])])
        .filter(([a, b]) => !isNaN(a) && !isNaN(b));
      if (pairs.length < 2) continue;
      const n = pairs.length;
      const sumX = pairs.reduce((a, [x]) => a + x, 0);
      const sumY = pairs.reduce((a, [, y]) => a + y, 0);
      const sumXY = pairs.reduce((a, [x, y]) => a + x * y, 0);
      const sumX2 = pairs.reduce((a, [x]) => a + x * x, 0);
      const sumY2 = pairs.reduce((a, [, y]) => a + y * y, 0);
      const corr = (n * sumXY - sumX * sumY) /
        Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      if (!isNaN(corr)) {
        correlations.push({
          column1: col1,
          column2: col2,
          coefficient: parseFloat(corr.toFixed(3)),
          strength: Math.abs(corr) > 0.7 ? 'strong' : Math.abs(corr) > 0.4 ? 'moderate' : 'weak'
        });
      }
    }
  }

  const anomalies = [];
  numericCols.forEach(col => {
    const values = data.map((row, idx) => ({ value: parseFloat(row[col]), index: idx })).filter(v => !isNaN(v.value));
    if (values.length < 3) return;
    const mean = values.reduce((a, b) => a + b.value, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b.value - mean, 2), 0) / values.length);
    values.forEach(({ value, index }) => {
      if (Math.abs(value - mean) > 2 * stdDev) {
        anomalies.push({
          column: col,
          row: index,
          value,
          type: value > mean ? 'high' : 'low',
          deviation: parseFloat(((value - mean) / stdDev).toFixed(2))
        });
      }
    });
  });

  return {
    fileName: file.originalName,
    fileType: file.fileType,
    totalRows: data.length,
    totalColumns: columns.length,
    statistics,
    trends,
    correlations: correlations.slice(0, 10),
    anomalies: anomalies.slice(0, 20),
    dataQuality: file.insights?.dataQuality || {},
    generatedAt: new Date()
  };
}

module.exports = router;
