// server/server.js

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const academyRoutes = require('./routes/academy');
const categoryRoutes = require('./routes/category');
const chainRoutes = require('./routes/chain');
const sessionRoutes = require('./routes/session');
const questionsRoutes = require('./routes/question');
const subscriptionRoutes = require('./routes/subscriptions');
const statsRoutes = require('./routes/stats');
const inboxRoutes = require('./routes/inbox'); // Import inbox routes

const app = express();
const PORT = process.env.PORT || 7000;

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
app.use('/api/inbox', inboxRoutes); // Add inbox routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
