const User = require('../models/User');
const Room = require('../models/Room');
const Review = require('../models/Review');
const Connection = require('../models/Connection');

// Get dashboard stats
exports.getDashboardStats = async(req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRooms = await Room.countDocuments();
        const totalReviews = await Review.countDocuments();
        const totalConnections = await Connection.countDocuments();
        const pendingApprovals = await Room.countDocuments({ status: 'pending' });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalRooms,
                totalReviews,
                totalConnections,
                pendingApprovals,
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all users
exports.getAllUsers = async(req, res) => {
    try {
        const { role, status } = req.query;
        let query = {};

        if (role) query.role = role;
        if (status === 'blocked') query.blocked = true;
        if (status === 'active') query.blocked = { $ne: true };

        const users = await User.find(query).select('-password');
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Block/Unblock user
exports.updateUserStatus = async(req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        const blocked = status === 'blocked' ? true : false;

        const user = await User.findByIdAndUpdate(
            userId, { blocked }, { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: `User ${status} successfully`,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete user
exports.deleteUser = async(req, res) => {
    try {
        const { userId } = req.params;

        // Delete user's rooms
        await Room.deleteMany({ owner: userId });

        // Delete user's reviews
        await Review.deleteMany({ $or: [{ reviewer: userId }, { owner: userId }] });

        // Delete user's connections
        await Connection.deleteMany({ $or: [{ student: userId }, { owner: userId }] });

        // Delete user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all rooms
exports.getAllRooms = async(req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status) query.status = status;

        const rooms = await Room.find(query)
            .populate('owner', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: rooms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Approve room
exports.approveRoom = async(req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findByIdAndUpdate(
            roomId, { status: 'approved' }, { new: true }
        ).populate('owner', 'firstName lastName email');

        res.status(200).json({
            success: true,
            message: 'Room approved successfully',
            data: room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reject room
exports.rejectRoom = async(req, res) => {
    try {
        const { roomId } = req.params;
        const { reason } = req.body;

        const room = await Room.findByIdAndUpdate(
            roomId, { status: 'rejected', rejectionReason: reason }, { new: true }
        ).populate('owner', 'firstName lastName email');

        res.status(200).json({
            success: true,
            message: 'Room rejected successfully',
            data: room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete room
exports.deleteRoom = async(req, res) => {
    try {
        const { roomId } = req.params;

        // Delete room reviews and connections
        await Review.deleteMany({ roomId });
        await Connection.deleteMany({ roomId });

        // Delete room
        await Room.findByIdAndDelete(roomId);

        res.status(200).json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all reviews
exports.getAllReviews = async(req, res) => {
    try {
        const reviews = await Review.find()
            .populate('reviewer', 'firstName lastName')
            .populate('room', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Flag/Unflag review
exports.updateReviewStatus = async(req, res) => {
    try {
        const { reviewId } = req.params;
        const { status } = req.body;

        const review = await Review.findByIdAndUpdate(
                reviewId, { status }, { new: true }
            ).populate('reviewer', 'firstName lastName')
            .populate('room', 'title');

        res.status(200).json({
            success: true,
            message: `Review ${status} successfully`,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete review
exports.deleteReview = async(req, res) => {
    try {
        const { reviewId } = req.params;

        await Review.findByIdAndDelete(reviewId);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all connections
exports.getAllConnections = async(req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status) query.status = status;

        const connections = await Connection.find(query)
            .populate('student', 'firstName lastName email')
            .populate('owner', 'firstName lastName email')
            .populate('room', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: connections
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update connection status
exports.updateConnectionStatus = async(req, res) => {
    try {
        const { connectionId } = req.params;
        const { status } = req.body;

        const connection = await Connection.findByIdAndUpdate(
                connectionId, { status }, { new: true }
            ).populate('student', 'firstName lastName')
            .populate('owner', 'firstName lastName')
            .populate('room', 'title');

        res.status(200).json({
            success: true,
            message: 'Connection status updated successfully',
            data: connection
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete connection
exports.deleteConnection = async(req, res) => {
    try {
        const { connectionId } = req.params;

        await Connection.findByIdAndDelete(connectionId);

        res.status(200).json({
            success: true,
            message: 'Connection deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};