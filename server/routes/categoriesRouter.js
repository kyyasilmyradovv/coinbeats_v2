const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getAllCategories } = require('../controllers/newCategoryControllers');
const router = express.Router();

router.get('/', getAllCategories);

module.exports = router;
