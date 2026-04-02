const express = require('express');
const { register, login, getUserProfile, updateUserProfile, getOwnerProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/owner/:ownerId', getOwnerProfile);

// Protected routes
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;