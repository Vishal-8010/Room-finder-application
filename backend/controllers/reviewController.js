const Review = require('../models/Review');
const Room = require('../models/Room');
const User = require('../models/User');

// Create review
exports.createReview = async(req, res) => {
    try {
        const { roomId, rating, title, comment } = req.body;

        if (!roomId || !rating || !title || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({
            room: roomId,
            reviewer: req.userId
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: 'You have already reviewed this room'
            });
        }

        const review = await Review.create({
            room: roomId,
            owner: room.owner,
            reviewer: req.userId,
            rating,
            title,
            comment
        });

        // Update room rating
        const reviews = await Review.find({ room: roomId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        room.rating = avgRating;
        room.reviewCount = reviews.length;
        await room.save();

        // Update owner rating
        const ownerReviews = await Review.find({ owner: room.owner });
        const ownerAvgRating = ownerReviews.reduce((sum, r) => sum + r.rating, 0) / ownerReviews.length;
        const owner = await User.findById(room.owner);
        owner.rating = ownerAvgRating;
        owner.reviewCount = ownerReviews.length;
        await owner.save();

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get room reviews
exports.getRoomReviews = async(req, res) => {
    try {
        const { roomId } = req.params;

        const reviews = await Review.find({ room: roomId })
            .populate('reviewer', 'firstName lastName avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get owner reviews
exports.getOwnerReviews = async(req, res) => {
    try {
        const { ownerId } = req.params;

        const reviews = await Review.find({ owner: ownerId })
            .populate('reviewer', 'firstName lastName avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update review
exports.updateReview = async(req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, title, comment } = req.body;

        let review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.reviewer.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this review'
            });
        }

        review = await Review.findByIdAndUpdate(
            reviewId, { rating, title, comment }, { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review
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

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.reviewer.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this review'
            });
        }

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