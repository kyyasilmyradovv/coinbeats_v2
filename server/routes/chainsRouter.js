const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getAllChains } = require('../controllers/newChainControllers');
const router = express.Router();

router.get('/', getAllChains);

module.exports = router;
