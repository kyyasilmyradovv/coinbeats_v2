const express = require('express');
const router = express.Router();
const {
  handleChat,
  getAllChats,
  createChat,
  updateChat,
  deleteChat,
  askChat,
} = require('../controllers/chatController');
const {
  getAllMessages,
  createMessage,
} = require('../controllers/aiChatMessageController');
const { protectForUser } = require('../controllers/userAuthControllers');
const { checkInputs } = require('../middleware/checkInputs');
const { getAllTopics, getTopic } = require('../controllers/aiTopicController');

// User routes
router.get('/topics', getAllTopics);
router.use('/', protectForUser);
router.get('/', getAllChats);
router.get('/topics/:id', getTopic);
router.post('/', checkInputs('chat', 'create'), createChat);
router.put('/:id', checkInputs('chat', 'update'), updateChat);
router.delete('/:id', deleteChat);
router.post('/ask', checkInputs('ask_chat', 'create'), askChat);
router.get('/:id/messages', getAllMessages);
router.post(
  '/:id/messages',
  checkInputs('chat_message', 'create'),
  createMessage
);

module.exports = router;
