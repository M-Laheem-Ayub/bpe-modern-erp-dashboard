require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');

const seed = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/smart_erp_db');
        console.log('MongoDB Connected');

        const email = 'laheem.ayub.dev@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }

        await Notification.create({
            user: user._id,
            type: 'success',
            title: 'Welcome to Smart ERP',
            message: 'Your notification system is now fully live and connected to the backend!',
            type: 'success'
        });

        console.log('Notification seeded for user:', user.name);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
