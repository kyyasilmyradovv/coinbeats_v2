// server/routes/inbox.js

const express = require('express');
const { getPendingAcademies, approveAcademy, rejectAcademy } = require('../controllers/academyController');
const router = express.Router();

// Route to get pending academies
router.get('/', getPendingAcademies);

// Route to approve an academy
router.post('/:id/approve', approveAcademy);

// Route to reject an academy
router.post('/:id/reject', rejectAcademy);

module.exports = router;
