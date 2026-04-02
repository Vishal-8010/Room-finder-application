const express = require('express');
const {
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
    isFavorite
} = require('../controllers/favoriteController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/:roomId', authMiddleware, addToFavorites);
router.delete('/:roomId', authMiddleware, removeFromFavorites);
router.get('/', authMiddleware, getUserFavorites);
router.get('/:roomId/check', authMiddleware, isFavorite);

module.exports = router;