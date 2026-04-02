const express = require('express');
const {
    createConnection,
    getUserConnections,
    getRoomConnections,
    updateConnectionStatus,
    scheduleViewing
} = require('../controllers/connectionController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/', authMiddleware, createConnection);
router.get('/', authMiddleware, getUserConnections);
router.get('/room/:roomId', authMiddleware, getRoomConnections);
router.put('/:connectionId/status', authMiddleware, updateConnectionStatus);
router.put('/:connectionId/viewing', authMiddleware, scheduleViewing);

module.exports = router;