const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    issueType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Open', 'Resolved'],
        default: 'Open'
    }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
