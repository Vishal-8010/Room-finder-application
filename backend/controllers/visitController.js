const VisitRequest = require('../models/VisitRequest');
const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

// Create a visit request (visitor is current user)
exports.createVisit = async(req, res) => {
    try {
        const { roomId, date, timeSlot, message } = req.body;
        if (!roomId || !date || !timeSlot) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const room = await Room.findById(roomId).populate('owner');
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

        const visit = await VisitRequest.create({
            room: room._id,
            visitor: req.userId,
            owner: room.owner._id,
            date: new Date(date),
            timeSlot,
            message,
            status: 'pending'
        });

        // Notify owner via message
        const visitorUser = await User.findById(req.userId);
        const content = `New visit request for your room \"${room.title}\" on ${new Date(date).toLocaleDateString()} at ${timeSlot} from ${visitorUser.firstName} ${visitorUser.lastName}.` + (message ? ` Message: ${message}` : '');
        await Message.create({ sender: req.userId, receiver: room.owner._id, room: room._id, content });

        return res.status(201).json({ success: true, visit });
    } catch (error) {
        console.error('createVisit error', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get visits for current user (as visitor)
exports.getUserVisits = async(req, res) => {
    try {
        const visits = await VisitRequest.find({ visitor: req.userId }).populate('room owner visitor');
        return res.status(200).json({ success: true, visits });
    } catch (error) {
        console.error('getUserVisits error', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get visits for owner (all requests for rooms owned by the user)
exports.getOwnerVisits = async(req, res) => {
    try {
        const visits = await VisitRequest.find({ owner: req.userId }).populate('room visitor owner');
        return res.status(200).json({ success: true, visits });
    } catch (error) {
        console.error('getOwnerVisits error', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update visit status (owner approves/rejects)
exports.updateVisitStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const visit = await VisitRequest.findById(id).populate('room visitor owner');
        if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
        // Normalize owner id whether owner is populated (object) or just an ObjectId
        const ownerId = visit.owner && (visit.owner._id ? visit.owner._id.toString() : visit.owner.toString());
        if (ownerId !== req.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        visit.status = status;
        await visit.save();

        // Notify visitor via message
        const ownerUser = await User.findById(req.userId);
        const content = `Your visit request for room \"${visit.room.title}\" on ${new Date(visit.date).toLocaleDateString()} at ${visit.timeSlot} was ${status.toUpperCase()} by ${ownerUser.firstName} ${ownerUser.lastName}.`;
        await Message.create({ sender: req.userId, receiver: visit.visitor._id || visit.visitor, room: visit.room._id, content });

        return res.status(200).json({ success: true, visit });
    } catch (error) {
        console.error('updateVisitStatus error', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get single visit
exports.getVisit = async(req, res) => {
    try {
        const visit = await VisitRequest.findById(req.params.id).populate('room visitor owner');
        if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
        // Only visitor or owner can view
        if (visit.visitor._id.toString() !== req.userId && visit.owner._id.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        return res.status(200).json({ success: true, visit });
    } catch (error) {
        console.error('getVisit error', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};