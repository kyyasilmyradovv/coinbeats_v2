// server/routes/category.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

// Routes for categories
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), createCategory);
router.get('/', getCategories);  // Make this route public
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), deleteCategory);

module.exports = router;
