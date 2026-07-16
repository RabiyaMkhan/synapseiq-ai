const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { files } = require('../db');

router.get('/:fileId', auth, async (req, res) => {
  try {
    const file = await files.findOne({ _id: req.params.fileId, user: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    const recommendations = generateRecommendations(file);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate recommendations', error: err.message });
  }
});

function generateRecommendations(file) {
  const data = Array.isArray(file.data) ? file.data : (file.data?.rows || []);
  const insights = file.insights || {};
  const recommendations = [];
  const actionItems = [];
  const weakAreas = [];
  const predictions = [];

  if (insights.missingValues > 0) {
    const missingPct = ((insights.missingValues / (data.length * (insights.columns ? insights.columns.length : 1))) * 100).toFixed(1);
    recommendations.push({
      type: 'data_quality',
      priority: 'high',
      title: 'Handle Missing Values',
      description: `Found ${missingPct}% missing values in the dataset. Consider imputing or removing incomplete records.`,
      impact: 'Improve data accuracy and analysis reliability'
    });
    weakAreas.push({ area: 'Data Completeness', severity: parseFloat(missingPct), description: `${missingPct}% of data is missing` });
  }

  if (insights.duplicates > 0) {
    recommendations.push({
      type: 'data_quality',
      priority: 'high',
      title: 'Remove Duplicate Records',
      description: `${insights.duplicates} duplicate rows detected. Removing them will improve analysis accuracy.`,
      impact: 'Eliminate biased results from repeated data'
    });
  }

  (insights.numericColumns || []).forEach(col => {
    const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    if (values.length < 3) return;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    const outliers = values.filter(v => Math.abs(v - mean) > 2 * stdDev);
    if (outliers.length > 0) {
      recommendations.push({
        type: 'outlier',
        priority: 'medium',
        title: `Review Outliers in "${col}"`,
        description: `${outliers.length} outlier(s) detected in ${col}. Values deviate significantly from the mean.`,
        impact: 'Ensure outliers are valid data points, not errors'
      });
    }
  });

  (insights.numericColumns || []).forEach(col => {
    const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    if (values.length < 5) return;
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const recent = values.slice(-Math.floor(values.length * 0.3));
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const overallAvg = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = ((recentAvg - overallAvg) / overallAvg) * 100;

    predictions.push({
      column: col,
      currentAverage: overallAvg.toFixed(2),
      recentTrend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      trendPercent: parseFloat(trend.toFixed(2)),
      prediction: trend > 5
        ? `Expected to continue rising. Projected next period: ~${(overallAvg * (1 + trend / 100)).toFixed(2)}`
        : trend < -5
        ? `Expected to continue declining. Projected next period: ~${(overallAvg * (1 + trend / 100)).toFixed(2)}`
        : `Expected to remain stable around ${overallAvg.toFixed(2)}`,
      confidence: Math.abs(trend) > 10 ? 'high' : Math.abs(trend) > 5 ? 'medium' : 'low'
    });
  });

  actionItems.push(
    { action: 'Review data quality report and address missing values', deadline: 'Immediate', category: 'Data Cleaning' },
    { action: 'Analyze correlations between key numeric columns', deadline: 'This week', category: 'Analysis' },
    { action: 'Set up automated data monitoring for anomalies', deadline: 'This month', category: 'Monitoring' },
    { action: 'Create dashboards for key performance indicators', deadline: 'This week', category: 'Visualization' },
    { action: 'Export findings and share with stakeholders', deadline: 'This month', category: 'Reporting' }
  );

  if ((insights.numericColumns || []).length > 0) {
    recommendations.push({
      type: 'optimization',
      priority: 'medium',
      title: 'Create Visual Dashboards',
      description: 'Your data has multiple numeric columns that would benefit from trend visualization.',
      impact: 'Better understanding of patterns and trends over time'
    });
  }

  if (data.length > 100) {
    recommendations.push({
      type: 'analysis',
      priority: 'low',
      title: 'Consider Segmentation Analysis',
      description: `With ${data.length} rows, segmenting the data by key categories could reveal hidden patterns.`,
      impact: 'More granular insights for decision-making'
    });
  }

  return {
    fileName: file.originalName,
    totalRecommendations: recommendations.length,
    recommendations,
    actionItems,
    weakAreas,
    predictions,
    overallScore: Math.max(50, 100 - (weakAreas.length * 15) - ((insights.missingValues || 0) > 0 ? 20 : 0)),
    generatedAt: new Date()
  };
}

module.exports = router;
