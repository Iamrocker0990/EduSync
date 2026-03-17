const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// All chat routes require authentication
router.use(protect);

// GET /api/chat/teachers - Fetch eligible teachers for a student
router.get('/teachers', chatController.getEligibleTeachers);

// GET /api/chat/conversations - Fetch all conversations for the current user
router.get('/conversations', chatController.getConversations);

// GET /api/chat/messages/:conversationId - Fetch messages for a specific conversation
router.get('/messages/:conversationId', chatController.getMessages);

// POST /api/chat/messages - Send a new message
router.post('/messages', chatController.sendMessage);

module.exports = router;
