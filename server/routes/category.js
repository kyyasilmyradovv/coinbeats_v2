// server/routes/category.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// Routes for categories
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(createCategory));
router.get('/', asyncHandler(getCategories));  // Make this route public
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(updateCategory));
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(deleteCategory));

module.exports = router;
