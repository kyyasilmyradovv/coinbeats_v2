// server/routes/subscriptions.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getSubscriptionSettings, toggleSubscriptionStatus, updateMonthlyFee, calculateMonthlyIncome } = require('../controllers/subscriptionController');

const router = express.Router();

router.get('/settings', authenticateToken, authorizeRoles('SUPERADMIN'), getSubscriptionSettings);
router.post('/toggle', authenticateToken, authorizeRoles('SUPERADMIN'), toggleSubscriptionStatus);
router.post('/fee', authenticateToken, authorizeRoles('SUPERADMIN'), updateMonthlyFee);
router.get('/income', authenticateToken, authorizeRoles('SUPERADMIN'), calculateMonthlyIncome);

module.exports = router;
