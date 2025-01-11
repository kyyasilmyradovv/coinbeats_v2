const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getAllCoins, getCoinsCount } = require('../controllers/coinController');

const router = express.Router();

router.get('/', asyncHandler(getAllCoins));
router.get('/count', asyncHandler(getCoinsCount));

module.exports = router;
