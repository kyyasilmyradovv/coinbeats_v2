// server/routes/chain.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  createChain,
  getChains,
  updateChain,
  deleteChain,
} = require('../controllers/chainController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// Routes for chains
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(createChain));
router.get('/', asyncHandler(getChains));  // Make this route public
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(updateChain));
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(deleteChain));

module.exports = router;
