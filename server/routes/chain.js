// server/routes/chain.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  createChain,
  getChains,
  updateChain,
  deleteChain,
} = require('../controllers/chainController');

const router = express.Router();

// Routes for chains
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), createChain);
router.get('/', getChains);  // Make this route public
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), updateChain);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), deleteChain);

module.exports = router;
