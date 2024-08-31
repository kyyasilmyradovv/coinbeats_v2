// routes/points.js

const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');

// Route to get points by user and academy
router.get('/:userId/:academyId', pointsController.getPointsByUserAndAcademy);

module.exports = router;
