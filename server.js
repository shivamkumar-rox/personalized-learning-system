require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const activityRoutes = require('./routes/activities');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

app.use(express.static('public'));

// Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Personalized Learning Analytics System API',
    endpoints: {
      students: '/api/students',
      courses: '/api/courses',
      activities: '/api/activities',
      quizzes: '/api/activities/quiz',
      analytics: [
        '/api/analytics/average-scores',
        '/api/analytics/time-spent',
        '/api/analytics/most-active-students',
        '/api/analytics/course-popularity',
        '/api/analytics/weak-topics/:studentId'
      ]
    }
  });
});

app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
