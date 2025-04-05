const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllAcademies,
  getAcademy,
} = require('../controllers/newAcademyControllers');
const router = express.Router();

router.get('/', getAllAcademies);
router.get('/:id', getAcademy);
// router.get('/:id', authenticateToken, getAcademy);

module.exports = router;
