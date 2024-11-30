// server/routes/category.js

const express = require('express');
const asyncHandler = require('express-async-handler');
const {
  getSurpriseBoxes,
  updateSurpriseBoxes,
} = require('../controllers/surpriseBoxController');

const router = express.Router();

router.get('/', asyncHandler(getSurpriseBoxes));
router.put('/', asyncHandler(updateSurpriseBoxes));

module.exports = router;
