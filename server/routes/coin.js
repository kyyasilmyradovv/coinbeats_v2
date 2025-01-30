const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllCoins,
  getCoinsCount,
  getCoin,
  searchCoins,
} = require('../controllers/coinController');

const router = express.Router();

router.get('/', asyncHandler(getAllCoins));
router.get('/search', asyncHandler(searchCoins));
router.get('/count', asyncHandler(getCoinsCount));
router.get('/:id', getCoin);

module.exports = router;
