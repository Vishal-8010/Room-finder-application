const User = require('../models/User');
const Room = require('../models/Room');

// Add room to favorites
exports.addToFavorites = async(req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        const user = await User.findById(req.userId);

        if (user.favorites.includes(roomId)) {
            return res.status(409).json({
                success: false,
                message: 'Room already in favorites'
            });
        }

        user.favorites.push(roomId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Room added to favorites'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove room from favorites
exports.removeFromFavorites = async(req, res) => {
    try {
        const { roomId } = req.params;

        const user = await User.findById(req.userId);

        if (!user.favorites.includes(roomId)) {
            return res.status(404).json({
                success: false,
                message: 'Room not in favorites'
            });
        }

        user.favorites = user.favorites.filter(id => id.toString() !== roomId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Room removed from favorites'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user favorites
exports.getUserFavorites = async(req, res) => {
    try {
        const user = await User.findById(req.userId).populate('favorites');

        res.status(200).json({
            success: true,
            count: user.favorites.length,
            favorites: user.favorites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Check if room is favorite
exports.isFavorite = async(req, res) => {
    try {
        const { roomId } = req.params;

        const user = await User.findById(req.userId);
        const isFav = user.favorites.includes(roomId);

        res.status(200).json({
            success: true,
            isFavorite: isFav
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};