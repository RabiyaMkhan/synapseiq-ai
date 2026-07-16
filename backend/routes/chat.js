const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { chats, files } = require('../db');

router.post('/:fileId', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const file = await files.findOne({ _id: req.params.fileId, user: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    let chat = await chats.findOne({ user: req.user._id, fileId: file._id });
    if (!chat) {
      chat = await chats.insert({
        user: req.user._id,
        fileId: file._id,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const userMessage = { role: 'user', content: message, timestamp: new Date().toISOString() };
    const context = buildDataContext(file);
    const assistantResponse = generateSmartResponse(message, context, file);
    const assistantMessage = { role: 'assistant', content: assistantResponse, timestamp: new Date().toISOString() };

    const updatedMessages = [...chat.messages, userMessage, assistantMessage];

    await chats.update(
      { _id: chat._id },
      { $set: { messages: updatedMessages, updatedAt: new Date().toISOString() } }
    );

    res.json({
      message: assistantResponse,
      chatId: chat._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Chat failed', error: err.message });
  }
});

router.get('/:fileId/history', auth, async (req, res) => {
  try {
    const chat = await chats.findOne({ user: req.user._id, fileId: req.params.fileId });
    if (!chat) return res.json({ messages: [] });
    res.json({ messages: chat.messages, chatId: chat._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get history', error: err.message });
  }
});

router.get('/conversations', auth, async (req, res) => {
  try {
    const userChats = await chats.find({ user: req.user._id }).sort({ updatedAt: -1 });

    const enriched = [];
    for (const chat of userChats) {
      const file = await files.findOne({ _id: chat.fileId });
      enriched.push({
        ...chat,
        fileId: file ? { _id: file._id, originalName: file.originalName, fileType: file.fileType } : chat.fileId
      });
    }

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get conversations', error: err.message });
  }
});

router.delete('/:chatId', auth, async (req, res) => {
  try {
    const chat = await chats.findOne({ _id: req.params.chatId, user: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Conversation not found' });
    await chats.remove({ _id: req.params.chatId });
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete conversation', error: err.message });
  }
});

function buildDataContext(file) {
  const data = Array.isArray(file.data) ? file.data : (file.data?.rows || []);
  const insights = file.insights || {};
  const columns = insights.columns || file.headers || [];
  const numericColumns = insights.numericColumns || [];
  const categoricalColumns = insights.categoricalColumns || [];
  const context = {
    fileName: file.originalName,
    fileType: file.fileType,
    totalRows: data.length,
    columns,
    numericColumns,
    categoricalColumns,
    statistics: {},
    sampleData: data.slice(0, 5),
    columnTypes: insights.columnTypes || {}
  };

  numericColumns.forEach(col => {
    const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    if (values.length === 0) return;
    context.statistics[col] = {
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      min: Math.min(...values),
      max: Math.max(...values),
      sum: values.reduce((a, b) => a + b, 0).toFixed(2),
      count: values.length
    };
  });

  return context;
}

function generateSmartResponse(question, context, file) {
  const q = question.toLowerCase();
  const data = Array.isArray(file.data) ? file.data : (file.data?.rows || []);

  if (q.includes('how many') || q.includes('total') || q.includes('count') || q.includes('rows')) {
    return `Your dataset "${file.originalName}" contains **${data.length} rows** of data with **${context.columns.length} columns**.\n\nThe columns are: ${context.columns.join(', ')}.`;
  }

  if (q.includes('summary') || q.includes('overview') || q.includes('describe') || q.includes('about')) {
    let summary = `## Dataset Overview: ${file.originalName}\n\n`;
    summary += `- **File Type:** ${file.fileType.toUpperCase()}\n`;
    summary += `- **Total Rows:** ${data.length}\n`;
    summary += `- **Total Columns:** ${context.columns.length}\n`;
    summary += `- **Numeric Columns:** ${context.numericColumns.join(', ') || 'None'}\n`;
    summary += `- **Categorical Columns:** ${context.categoricalColumns.join(', ') || 'None'}\n\n`;
    summary += `### Sample Data (first 3 rows):\n`;
    data.slice(0, 3).forEach((row, i) => {
      summary += `\n**Row ${i + 1}:** ${Object.entries(row).map(([k, v]) => `${k}=${v}`).join(', ')}`;
    });
    return summary;
  }

  if (q.includes('average') || q.includes('mean') || q.includes('avg')) {
    if (context.numericColumns.length === 0) {
      return 'No numeric columns found in this dataset to calculate averages.';
    }
    let response = '## Average Values\n\n';
    context.numericColumns.forEach(col => {
      const stats = context.statistics[col];
      if (stats) {
        response += `- **${col}:** ${stats.avg}\n`;
      }
    });
    return response;
  }

  if (q.includes('max') || q.includes('highest') || q.includes('maximum') || q.includes('largest')) {
    let response = '## Maximum Values\n\n';
    context.numericColumns.forEach(col => {
      const stats = context.statistics[col];
      if (stats) {
        response += `- **${col}:** ${stats.max}\n`;
      }
    });
    return response || 'No numeric columns found.';
  }

  if (q.includes('min') || q.includes('lowest') || q.includes('minimum') || q.includes('smallest')) {
    let response = '## Minimum Values\n\n';
    context.numericColumns.forEach(col => {
      const stats = context.statistics[col];
      if (stats) {
        response += `- **${col}:** ${stats.min}\n`;
      }
    });
    return response || 'No numeric columns found.';
  }

  if (q.includes('sum') || q.includes('total') || q.includes('add up')) {
    let response = '## Sum of Values\n\n';
    context.numericColumns.forEach(col => {
      const stats = context.statistics[col];
      if (stats) {
        response += `- **${col}:** ${parseFloat(stats.sum).toLocaleString()}\n`;
      }
    });
    return response || 'No numeric columns found.';
  }

  if (q.includes('column') || q.includes('feature') || q.includes('field')) {
    let response = '## Column Information\n\n';
    context.columns.forEach(col => {
      const type = context.columnTypes[col] || 'unknown';
      const emoji = type === 'number' ? '1234567890' : type === 'date' ? 'DATE' : 'TEXT';
      response += `- **${col}** (${type})\n`;
    });
    return response;
  }

  if (q.includes('insight') || q.includes('pattern') || q.includes('trend')) {
    let response = '## Key Insights\n\n';
    if (file.insights && file.insights.patterns) {
      file.insights.patterns.forEach(p => {
        if (typeof p === 'string') {
          response += `- ${p}\n`;
        } else if (p.title) {
          response += `- **${p.title}**: ${p.description}\n`;
        }
      });
    }
    if (file.insights && file.insights.anomalies) {
      const anomalyCount = typeof file.insights.anomalies === 'object' ? file.insights.anomalies.count : file.insights.anomalies;
      if (anomalyCount > 0) {
        response += `\n**${anomalyCount} anomalies** detected in the data.`;
      }
    }
    if (file.insights && file.insights.dataQuality && file.insights.dataQuality.completeness) {
      response += `\n\n**Data Quality Score:** ${file.insights.dataQuality.completeness}% complete`;
    }
    return response;
  }

  if (q.includes('recommend') || q.includes('suggest') || q.includes('advice') || q.includes('improve')) {
    let response = '## Recommendations\n\n';
    if (file.insights && file.insights.recommendations) {
      file.insights.recommendations.forEach(r => {
        response += `- ${r}\n`;
      });
    } else {
      response += '- Review data for missing values\n- Consider removing duplicate entries\n- Validate data types for each column\n- Check for outliers in numeric fields';
    }
    return response;
  }

  if (q.includes('quality') || q.includes('missing') || q.includes('null') || q.includes('clean')) {
    const dq = (file.insights && file.insights.dataQuality) || {};
    return `## Data Quality Report\n\n- **Completeness:** ${dq.completeness || 'N/A'}%\n- **Total Rows:** ${data.length}\n- **Duplicate Rows:** ${dq.duplicates || 0}\n\n### Quality Notes\n- Data appears ${dq.completeness > 90 ? 'high quality' : dq.completeness > 70 ? 'moderately clean' : 'in need of cleaning'}\n- Consider removing or imputing missing values for better analysis.`;
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q === 'help') {
    return `Hello! I'm your AI data assistant for **${file.originalName}**.\n\nI can help you with:\n- **Data overview** - Ask "give me a summary"\n- **Statistics** - Ask "what are the averages?"\n- **Trends** - Ask "what insights do you see?"\n- **Recommendations** - Ask "what do you recommend?"\n- **Quality check** - Ask "how is the data quality?"\n\nJust ask me anything about your data!`;
  }

  return `Thanks for your question! Based on your dataset **"${file.originalName}"** (${data.length} rows, ${context.columns.length} columns):\n\nI analyzed your query and here's what I found:\n- The dataset has ${context.numericColumns.length} numeric and ${context.categoricalColumns.length} categorical columns\n- Key columns: ${context.columns.slice(0, 5).join(', ')}\n\nTry asking me specific questions like:\n- "What is the average of [column]?"\n- "Give me a summary of the data"\n- "What insights do you see?"\n- "What are the recommendations?"`;
}

module.exports = router;
