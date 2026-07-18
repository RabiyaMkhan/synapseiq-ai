const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const analysisRoutes = require('./routes/analysis');
const chatRoutes = require('./routes/chat');
const recommendationRoutes = require('./routes/recommendations');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/user', userRoutes);

console.log('');
console.log('================================================');
console.log('  NeDB is being used as the database.');
console.log('  No MongoDB installation required!');
console.log('  Data is stored locally in the data/ directory.');
console.log('================================================');
console.log('');

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'nedb', timestamp: new Date().toISOString() });
});

const frontendBuild = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
