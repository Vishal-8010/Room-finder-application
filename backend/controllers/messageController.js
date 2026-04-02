const Message = require('../models/Message');

// Send message
exports.sendMessage = async(req, res) => {
    try {
        const { receiverId, roomId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide receiver and content'
            });
        }

        const message = await Message.create({
            sender: req.userId,
            receiver: receiverId,
            room: roomId,
            content
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get messages between two users
exports.getConversation = async(req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
                $or: [
                    { sender: req.userId, receiver: userId },
                    { sender: userId, receiver: req.userId }
                ]
            })
            .populate('sender', 'firstName lastName avatar')
            .populate('receiver', 'firstName lastName avatar')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all conversations for user
exports.getAllConversations = async(req, res) => {
    try {
        const messages = await Message.find({
                $or: [{ sender: req.userId }, { receiver: req.userId }]
            })
            .populate('sender', 'firstName lastName avatar')
            .populate('receiver', 'firstName lastName avatar')
            .sort({ createdAt: -1 });

        // Group messages by conversation
        const conversations = {};
        messages.forEach(msg => {
            const otherUserId = msg.sender._id.toString() === req.userId ? msg.receiver._id : msg.sender._id;
            if (!conversations[otherUserId]) {
                conversations[otherUserId] = {
                    otherUser: msg.sender._id.toString() === req.userId ? msg.receiver : msg.sender,
                    lastMessage: {
                        content: msg.content,
                        createdAt: msg.createdAt
                    },
                    timestamp: msg.createdAt,
                    unreadCount: 0
                };
            }
            if (!msg.read && msg.receiver._id.toString() === req.userId) {
                conversations[otherUserId].unreadCount++;
            }
        });

        res.status(200).json({
            success: true,
            conversations: Object.values(conversations)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark message as read
exports.markAsRead = async(req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findByIdAndUpdate(
            messageId, { read: true }, { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Message marked as read',
            data: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get unread message count
exports.getUnreadCount = async(req, res) => {
    try {
        const unreadCount = await Message.countDocuments({
            receiver: req.userId,
            read: false
        });

        res.status(200).json({
            success: true,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};