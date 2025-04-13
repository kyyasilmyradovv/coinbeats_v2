const express = require('express');
const {
  protectForUser,
  weakProtect,
} = require('../controllers/userAuthControllers');
const { getOverallRaffles } = require('../controllers/newRaffleController');
const router = express.Router();

// User apis
router.get('/overall', weakProtect, getOverallRaffles);

module.exports = router;
