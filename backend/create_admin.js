const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: __dirname + '/.env' });

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/room-rental';
console.log('Creating admin using DB URI:', mongoUri);

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async() => {
        try {
            const existing = await User.findOne({ email: 'bursekaushal4@gmail.com' });
            if (existing) {
                console.log('Admin already exists in target DB');
                process.exit(0);
            }

            const admin = await User.create({
                firstName: 'Kaushal',
                lastName: 'Burse',
                email: 'bursekaushal4@gmail.com',
                password: 'kaushal@2004',
                phone: '9999999999',
                role: 'admin'
            });

            console.log('Admin user created:', admin.email);
            process.exit(0);
        } catch (err) {
            console.error('Error creating admin:', err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('DB connection error:', err);
        process.exit(1);
    });