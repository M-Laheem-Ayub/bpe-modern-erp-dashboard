const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    requesterName: { type: String, required: true },
    issueDescription: { type: String, required: true },
    priority: {
        type: String,
        enum: ['Low', 'High'],
        default: 'Low'
    },
    status: {
        type: String,
        enum: ['Open', 'Resolved'],
        default: 'Open'
    }
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
