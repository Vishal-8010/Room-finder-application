const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminOnlyMiddleware } = require('../middleware/auth');

// Apply auth middleware to all admin routes
router.use(authMiddleware, adminOnlyMiddleware);

// Dashboard
router.get('/stats', adminController.getDashboardStats);

// Users Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// Rooms Management
router.get('/rooms', adminController.getAllRooms);
router.put('/rooms/:roomId/approve', adminController.approveRoom);
router.put('/rooms/:roomId/reject', adminController.rejectRoom);
router.delete('/rooms/:roomId', adminController.deleteRoom);

// Reviews Management
router.get('/reviews', adminController.getAllReviews);
router.put('/reviews/:reviewId/status', adminController.updateReviewStatus);
router.delete('/reviews/:reviewId', adminController.deleteReview);

// Connections Management
router.get('/connections', adminController.getAllConnections);
router.put('/connections/:connectionId/status', adminController.updateConnectionStatus);
router.delete('/connections/:connectionId', adminController.deleteConnection);

module.exports = router;