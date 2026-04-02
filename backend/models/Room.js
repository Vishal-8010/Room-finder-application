const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Room title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    locationName: {
        type: String,
        required: [true, 'Location name is required']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    amenities: [{
        type: String
    }],
    size: {
        type: String
    },
    deposit: {
        type: Number,
        default: 0
    },
    availableFrom: {
        type: Date
    },
    image: {
        type: String
    },
    images: [{
        type: String
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner is required']
    },
    verified: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
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

// Create geospatial index for bounds-based queries
roomSchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('Room', roomSchema);