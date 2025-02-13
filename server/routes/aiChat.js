// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { requirePrivyAuth } = require('../middleware/privyAuth');
const { handleChat } = require('../controllers/aiChatController');

router.post('/chat', requirePrivyAuth, handleChat);

module.exports = router;
