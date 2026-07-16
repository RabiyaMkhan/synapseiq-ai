const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { users, files, reports, chats } = require('../db');

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await users.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fileCount = await files.count({ user: req.user._id });
    const reportCount = await reports.count({ user: req.user._id });
    const chatCount = await chats.count({ user: req.user._id });

    const { password, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      stats: {
        totalFiles: fileCount,
        totalReports: reportCount,
        totalConversations: chatCount,
        memberSince: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    await users.update({ _id: req.user._id }, { $set: updates });

    const updatedUser = await users.findOne({ _id: req.user._id });
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({ user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const fileCount = await files.count({ user: req.user._id });
    const reportCount = await reports.count({ user: req.user._id });
    const chatCount = await chats.count({ user: req.user._id });
    const userFiles = await files.find({ user: req.user._id });

    const totalStorage = userFiles.reduce((acc, f) => acc + (f.fileSize || 0), 0);
    const fileTypes = userFiles.reduce((acc, f) => {
      acc[f.fileType] = (acc[f.fileType] || 0) + 1;
      return acc;
    }, {});

    const recentUploads = userFiles
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      totalFiles: fileCount,
      totalReports: reportCount,
      totalConversations: chatCount,
      totalStorage,
      fileTypes,
      recentUploads
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get stats', error: err.message });
  }
});

router.get('/upload-history', auth, async (req, res) => {
  try {
    const userFiles = await files.find({ user: req.user._id }).sort({ createdAt: -1 });

    const history = userFiles.map(f => ({
      _id: f._id,
      originalName: f.originalName,
      fileType: f.fileType,
      fileSize: f.fileSize,
      createdAt: f.createdAt
    }));

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get history', error: err.message });
  }
});

module.exports = router;
