// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { requirePrivyAuth } = require('../middleware/privyAuth');
// const {
//   handleChat,
//   getAllChats,
//   createChat,
//   updateChat,
//   deleteChat,
// } = require('../controllers/aiChatController');
const {
  getAllMessages,
  createMessage,
} = require('../controllers/aiChatMessageController');
router.post('/chat', requirePrivyAuth, handleChat);

// User routes
// router.get('/', asyncHandler(getAllChats));
// router.post('/', asyncHandler(createChat));
// router.put('/:id', asyncHandler(updateChat));
// router.delete('/:id', asyncHandler(deleteChat));
// router.get('/:id/messages', asyncHandler(getAllMessages));
// router.post('/:id/messages', asyncHandler(createMessage));

module.exports = router;
