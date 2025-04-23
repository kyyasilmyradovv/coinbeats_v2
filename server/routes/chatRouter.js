// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { requirePrivyAuth } = require('../middleware/privyAuth');
const {
  handleChat,
  getAllChats,
  createChat,
  updateChat,
  deleteChat,
} = require('../controllers/chatController');
const {
  getAllMessages,
  createMessage,
} = require('../controllers/aiChatMessageController');
const { protectForUser } = require('../controllers/userAuthControllers');
const { checkInputs } = require('../middleware/checkInputs');

// router.post('/chat', requirePrivyAuth, handleChat);

// User routes
router.use('/', protectForUser);
router.get('/', getAllChats);
router.post('/', checkInputs('chat', 'create'), createChat);
// router.put('/:id', updateChat);
// router.delete('/:id', deleteChat);
// router.get('/:id/messages', getAllMessages);
// router.post('/:id/messages', createMessage);

module.exports = router;
