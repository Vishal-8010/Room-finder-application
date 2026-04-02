const express = require('express');
const {
    createReview,
    getRoomReviews,
    getOwnerReviews,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/room/:roomId', getRoomReviews);
router.get('/owner/:ownerId', getOwnerReviews);

// Protected routes
router.post('/', authMiddleware, createReview);
router.put('/:reviewId', authMiddleware, updateReview);
router.delete('/:reviewId', authMiddleware, deleteReview);

module.exports = router;