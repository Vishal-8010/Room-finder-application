const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async(req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, phone, role, college, course, year, propertyCount, experience } = req.body;

        // Validate input
        if (!firstName || !lastName || !email || !password || !phone || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            role,
            college: role === 'student' ? college : undefined,
            course: role === 'student' ? course : undefined,
            year: role === 'student' ? year : undefined,
            propertyCount: role === 'owner' ? propertyCount : undefined,
            experience: role === 'owner' ? experience : undefined
        });

        // Generate token
        const token = jwt.sign({ userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                rating: user.rating,
                reviewCount: user.reviewCount,
                verified: user.verified,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Login user
exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and select password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                rating: user.rating,
                reviewCount: user.reviewCount,
                verified: user.verified,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user profile
exports.getUserProfile = async(req, res) => {
    try {
        const user = await User.findById(req.userId).populate('favorites');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update user profile
exports.updateUserProfile = async(req, res) => {
    try {
        const { firstName, lastName, phone, bio, avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId, { firstName, lastName, phone, bio, avatar }, { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get owner profile by ID
exports.getOwnerProfile = async(req, res) => {
    try {
        const { ownerId } = req.params;

        const owner = await User.findById(ownerId);

        if (!owner || owner.role !== 'owner') {
            return res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
        }

        res.status(200).json({
            success: true,
            owner: {
                _id: owner._id,
                firstName: owner.firstName,
                lastName: owner.lastName,
                rating: owner.rating,
                reviewCount: owner.reviewCount,
                experience: owner.experience,
                propertyCount: owner.propertyCount,
                verified: owner.verified,
                avatar: owner.avatar,
                bio: owner.bio
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};