// server/server.js

const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const createError = require('http-errors');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: path.resolve(__dirname, envFile) });

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const academyRoutes = require('./routes/academy');
const categoryRoutes = require('./routes/category');
const chainRoutes = require('./routes/chain');
const sessionRoutes = require('./routes/session');
const questionsRoutes = require('./routes/question');
const subscriptionRoutes = require('./routes/subscriptions');
const statsRoutes = require('./routes/stats');
const inboxRoutes = require('./routes/inbox');
const emailRoutes = require('./routes/email');
const sseRoutes = require('./routes/sse');
const pointsRoutes = require('./routes/points');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route configuration
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academies', academyRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chains', chainRoutes);
app.use('/api', sessionRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/sse', sseRoutes);
app.use('/api/points', pointsRoutes);


// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, 'Not Found'));
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.message);
  
  const response = {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  res.status(err.status || 500);
  res.json(response);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
