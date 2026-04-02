const Connection = require('../models/Connection');
const Room = require('../models/Room');

// Create connection
exports.createConnection = async(req, res) => {
    try {
        const { roomId, studentName, studentEmail, studentPhone, studentCollege, studentCourse, moveInDate, duration, message } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        const existingConnection = await Connection.findOne({
            room: roomId,
            student: req.userId,
            status: { $ne: 'rejected' }
        });

        if (existingConnection) {
            return res.status(409).json({
                success: false,
                message: 'You already have a connection for this room'
            });
        }

        const connection = await Connection.create({
            room: roomId,
            student: req.userId,
            owner: room.owner,
            studentName,
            studentEmail,
            studentPhone,
            studentCollege,
            studentCourse,
            moveInDate,
            duration,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Connection created successfully',
            connection
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user connections
exports.getUserConnections = async(req, res) => {
    try {
        const connections = await Connection.find({
                $or: [{ student: req.userId }, { owner: req.userId }]
            })
            .populate('room')
            .populate('student', 'firstName lastName email phone avatar')
            .populate('owner', 'firstName lastName email phone avatar');

        res.status(200).json({
            success: true,
            count: connections.length,
            connections
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get room connections (owner only)
exports.getRoomConnections = async(req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        if (room.owner.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view these connections'
            });
        }

        const connections = await Connection.find({ room: roomId })
            .populate('student', 'firstName lastName email phone avatar')
            .populate('room');

        res.status(200).json({
            success: true,
            count: connections.length,
            connections
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

        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({
                success: false,
                message: 'Connection not found'
            });
        }

        if (connection.owner.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this connection'
            });
        }

        if (!['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        connection.status = status;
        await connection.save();

        res.status(200).json({
            success: true,
            message: 'Connection updated successfully',
            connection
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Schedule viewing
exports.scheduleViewing = async(req, res) => {
    try {
        const { connectionId } = req.params;
        const { viewingDate } = req.body;

        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({
                success: false,
                message: 'Connection not found'
            });
        }

        if (connection.owner.toString() !== req.userId && connection.student.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to schedule a viewing'
            });
        }

        connection.viewingScheduled = true;
        connection.viewingDate = new Date(viewingDate);
        await connection.save();

        res.status(200).json({
            success: true,
            message: 'Viewing scheduled successfully',
            connection
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};