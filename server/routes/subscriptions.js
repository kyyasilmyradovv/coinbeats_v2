// server/routes/subscriptions.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { 
    getSubscriptionSettings, 
    toggleSubscriptionStatus, 
    updateMonthlyFee, 
    calculateMonthlyIncome 
} = require('../controllers/subscriptionController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

router.get('/settings', authenticateToken, authorizeRoles('SUPERADMIN'), asyncHandler(getSubscriptionSettings));
router.post('/toggle', authenticateToken, authorizeRoles('SUPERADMIN'), asyncHandler(toggleSubscriptionStatus));
router.post('/fee', authenticateToken, authorizeRoles('SUPERADMIN'), asyncHandler(updateMonthlyFee));
router.get('/income', authenticateToken, authorizeRoles('SUPERADMIN'), asyncHandler(calculateMonthlyIncome));

module.exports = router;
