const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getCounter } = require('../controllers/counterControllers');
const router = express.Router();

router.get('/', getCounter);

module.exports = router;
