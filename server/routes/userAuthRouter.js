const express = require('express');
const {
  login,
  sendMeCode,
  refreshToken,
  signinGoogle,
  protectForUser,
  getMyProfile,
  verifyMyEmail,
  updateProfile,
} = require('../controllers/userAuthControllers');
const { checkInputs } = require('../middleware/checkInputs');
const router = express.Router();

router.post('/login', checkInputs('login', 'create'), login);
router.post('/send-me-code', checkInputs('send_me_code', 'create'), sendMeCode);
router.post('/verify', checkInputs('verify', 'create'), verifyMyEmail);
router.post(
  '/refresh-token',
  checkInputs('refresh_token', 'create'),
  refreshToken
);
router.post('/google-signin', signinGoogle);
router.use(protectForUser);
router.get('/profile', getMyProfile);
router.put('/profile', checkInputs('profile', 'update'), updateProfile);

module.exports = router;
