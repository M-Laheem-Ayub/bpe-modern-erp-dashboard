const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const Notification = require('../models/Notification');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'admin'
        });

        await user.save();

        await Notification.create({
            user: user._id,
            type: 'info',
            title: 'Welcome to Smart ERP! 🎉',
            message: `Hello ${user.name}, we are excited to have you on board.`
        });

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret123', // Fallback for dev if env is missing
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        if (user.lastLogin) {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            if (user.lastLogin < threeDaysAgo) {
                await Notification.create({
                    user: user._id,
                    type: 'info',
                    title: 'Welcome Back! 👋',
                    message: `It's been a while. Good to see you again, ${user.name}.`
                });
            }
        } else {
            await Notification.create({
                user: user._id,
                type: 'info',
                title: 'Welcome Back! 👋',
                message: `Good to see you again, ${user.name}.`
            });
        }

        user.lastLogin = Date.now();
        await user.save();

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return res.status(200).json({ message: 'If account exists, email sent.' });
        }

        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '15m' }
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const clientUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${clientUrl}/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Your Password - Smart ERP',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #4F46E5; text-align: center;">Reset Your Password</h2>
                    <p>Hello ${user.name},</p>
                    <p>Click the button below to reset your password. This link is valid for 15 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Set New Password</a>
                    </div>
                    <p style="font-size: 12px; color: #777; text-align: center;">If you didn't reqest this, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email sent' });

    } catch (err) {
        console.error("Email error:", err);
        res.status(500).send('Server Error');
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(400).json({ message: 'Invalid token' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.json({ message: 'Password has been updated successfully.' });

    } catch (err) {
        console.error(err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Token has expired. Please request a new link.' });
        }
        res.status(500).send('Server Error');
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);

        await Notification.deleteMany({ user: req.user.id });

        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
