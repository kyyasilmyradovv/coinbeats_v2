// server/server.js

const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session');
const bigIntMiddleware = require('./middleware/bigIntMiddleware');
const cors = require('cors');
const createError = require('http-errors');

// Load environment variables
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
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
const pointsControlRoutes = require('./routes/pointsControl');
const verificationTaskRoutes = require('./routes/verificationTask');
const academyTypeRoutes = require('./routes/academyType');
const settingsRoutes = require('./routes/settings');
const characterLevelRoutes = require('./routes/characterLevel');
const notificationRoutes = require('./routes/notificationRoutes');
const superadminRoutes = require('./routes/superadmin');
const discoverRoutes = require('./routes/discover');
const contentRoutes = require('./routes/content');
const surpriseBoxRoutes = require('./routes/surpriseBox');
const raffleRoutes = require('./routes/raffle');
const coinRoutes = require('./routes/coin');
const aiChatRoutes = require('./routes/aiChat');
const downloadRoutes = require('./routes/downloadRoutes'); // <--

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Allow Express to trust the proxy (Nginx) for real client IP
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// **Add Session Middleware Here**
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Custom middleware
app.use(bigIntMiddleware);

// Routes
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
app.use('/api/points-control', pointsControlRoutes);
app.use('/api/verification-tasks', verificationTaskRoutes);
app.use('/api/academy-types', academyTypeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/character-levels', characterLevelRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/surprise-box', surpriseBoxRoutes);
app.use('/api/raffle', raffleRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api', downloadRoutes);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(
  '/downloads',
  express.static(path.join(__dirname, 'public', 'downloads'))
);

// Cron jobs
require('./utils/cronJobs.js');

// Catch 404
app.use((req, res, next) => {
  next(createError(404, 'Not Found'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.message);
  const response = {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };
  res.status(err.status || 500).json(response);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
