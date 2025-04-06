const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { login, sendMeCode } = require('../controllers/userAuthControllers');
const { checkInputs } = require('../middleware/checkInputs');
const router = express.Router();

router.post('/login', checkInputs('login', 'create'), login);
router.post('/send-me-code', checkInputs('send_me_code', 'create'), sendMeCode);

module.exports = router;
