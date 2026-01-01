const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    interestLevel: {
        type: String,
        enum: ['Hot', 'Warm', 'Cold'],
        default: 'Warm'
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Closed'],
        default: 'New'
    }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
