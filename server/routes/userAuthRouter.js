const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  login,
  sendMeCode,
  refreshToken,
  signinGoogle,
  protectForUser,
  getMyProfile,
} = require('../controllers/userAuthControllers');
const { checkInputs } = require('../middleware/checkInputs');
const router = express.Router();

router.post('/login', checkInputs('login', 'create'), login);
router.post('/send-me-code', checkInputs('send_me_code', 'create'), sendMeCode);
router.post(
  '/refresh-token',
  checkInputs('refresh_token', 'create'),
  refreshToken
);
router.post('/google-signin', signinGoogle);
router.use(protectForUser);
router.get('/profile', getMyProfile);

module.exports = router;
