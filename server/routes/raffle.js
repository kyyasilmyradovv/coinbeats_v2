const express = require('express');
const asyncHandler = require('express-async-handler');
const { getMyRaffles } = require('../controllers/raffleController');

const router = express.Router();

router.get('/', asyncHandler(getMyRaffles));

module.exports = router;
