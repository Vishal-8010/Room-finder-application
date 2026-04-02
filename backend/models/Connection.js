const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
    },
    studentName: String,
    studentEmail: String,
    studentPhone: String,
    studentCollege: String,
    studentCourse: String,
    moveInDate: Date,
    duration: String,
    message: String,
    viewingScheduled: {
        type: Boolean,
        default: false
    },
    viewingDate: Date,
    connectedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Connection', connectionSchema);