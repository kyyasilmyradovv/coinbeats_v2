const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  createAcademy,
  listMyAcademies,
  getAcademyDetails,
  updateAcademy,
} = require('../controllers/academyController');

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'),
  createAcademy
);
router.get('/my', authenticateToken, listMyAcademies);
router.get('/:id', authenticateToken, getAcademyDetails);
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'),
  updateAcademy
);

module.exports = router;
