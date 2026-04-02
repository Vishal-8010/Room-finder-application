const express = require('express');
const {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    getOwnerRooms,
    searchByBounds,
    searchNearbyRooms
} = require('../controllers/roomController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllRooms);
router.get('/search/by-bounds', searchByBounds);
router.get('/search/nearby', searchNearbyRooms);
router.get('/:roomId', getRoomById);
router.get('/owner/:ownerId', getOwnerRooms);

// Protected routes
router.post('/', authMiddleware, createRoom);
router.put('/:roomId', authMiddleware, updateRoom);
router.delete('/:roomId', authMiddleware, deleteRoom);

module.exports = router;