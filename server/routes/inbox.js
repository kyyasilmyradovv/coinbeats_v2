// server/routes/inbox.js

const express = require('express');
const { getPendingAcademies, approveAcademy, rejectAcademy } = require('../controllers/academyController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// Route to get pending academies
router.get('/', asyncHandler(getPendingAcademies));

// Route to approve an academy
router.post('/:id/approve', asyncHandler(approveAcademy));

// Route to reject an academy
router.post('/:id/reject', asyncHandler(rejectAcademy));

module.exports = router;
