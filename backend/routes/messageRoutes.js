const express = require('express');
const {
    sendMessage,
    getConversation,
    getAllConversations,
    markAsRead,
    getUnreadCount
} = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/', authMiddleware, sendMessage);
router.get('/conversations', authMiddleware, getAllConversations);
router.get('/unread', authMiddleware, getUnreadCount);
router.get('/:userId', authMiddleware, getConversation);
router.put('/:messageId/read', authMiddleware, markAsRead);

module.exports = router;