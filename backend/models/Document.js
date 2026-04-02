const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    documentType: {
        type: String,
        enum: ['idProof', 'rentalAgreement', 'other'],
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    filePath: {
        type: String
    },
    fileSize: {
        type: Number
    },
    mimeType: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
    },
    isDigitallySigned: {
        type: Boolean,
        default: false
    },
    signedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    signatureTimestamp: {
        type: Date
    },
    metadata: {
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        verifiedAt: Date,
        expiresAt: Date,
        notes: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);