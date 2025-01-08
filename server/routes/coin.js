const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getAllCoins } = require('../controllers/coinController');

const router = express.Router();

router.get('/', asyncHandler(getAllCoins));

module.exports = router;
