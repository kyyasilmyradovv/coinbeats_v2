const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllAcademies,
  getAcademy,
} = require('../controllers/newAcademyControllers');
const { protectForUser } = require('../controllers/userAuthControllers');
const router = express.Router();

router.get('/', getAllAcademies);
// router.use(protectForUser);
router.get('/:id', getAcademy);
// router.get('/:id', authenticateToken, getAcademy);

module.exports = router;
