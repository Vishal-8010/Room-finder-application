const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['published', 'flagged'],
        default: 'published'
    },
    helpful: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);