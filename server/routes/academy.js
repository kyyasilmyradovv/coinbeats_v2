// server/routes/academy.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  createAcademy,
  listMyAcademies,
  getAcademyDetails,
  updateAcademy,
  getPendingAcademies,
  approveAcademy,
  rejectAcademy,
} = require('../controllers/academyController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'),
  asyncHandler(createAcademy)
);
router.get('/my', authenticateToken, asyncHandler(listMyAcademies));
router.get('/:id', authenticateToken, asyncHandler(getAcademyDetails));
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'),
  asyncHandler(updateAcademy)
);
router.get('/pending', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(getPendingAcademies));
router.post('/:id/approve', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(approveAcademy));
router.post('/:id/reject', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(rejectAcademy));

module.exports = router;
