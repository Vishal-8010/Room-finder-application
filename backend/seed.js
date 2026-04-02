const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB (support both MONGO_URI and MONGODB_URI env names)
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/roomnest';
// Ensure we log which URI is being used for seeding
console.log('Seeding DB using URI:', mongoUri);
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const seedAdminUser = async() => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'bursekaushal4@gmail.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            firstName: 'Kaushal',
            lastName: 'Burse',
            email: 'bursekaushal4@gmail.com',
            password: 'kaushal@2004',
            phone: '9999999999',
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email: bursekaushal4@gmail.com');
        console.log('Password: kaushal@2004');
        console.log('Role: admin');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

seedAdminUser();