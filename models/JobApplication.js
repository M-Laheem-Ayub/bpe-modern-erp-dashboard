const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    candidateName: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Interview', 'Hired'],
        default: 'Applied'
    },
    resumeLink: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
