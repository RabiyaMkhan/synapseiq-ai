const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['csv', 'xlsx', 'pdf'],
    required: true
  },
  fileSize: {
    type: Number
  },
  filePath: {
    type: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  summary: {
    type: String,
    default: null
  },
  insights: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UploadedFile', uploadedFileSchema);