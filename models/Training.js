const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
    employeeName: { type: String, required: true },
    trainingTopic: { type: String, required: true },
    completionDate: { type: Date },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed'],
        default: 'Scheduled'
    }
}, { timestamps: true });

module.exports = mongoose.model('Training', trainingSchema);
