const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllAcademyTypes,
} = require('../controllers/newAcademyTypeControllers');
const router = express.Router();

router.get('/', getAllAcademyTypes);

module.exports = router;
