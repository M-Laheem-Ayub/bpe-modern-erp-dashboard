const mongoose = require('mongoose');

const procurementSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Requested', 'Approved', 'Ordered'],
        default: 'Requested'
    }
}, { timestamps: true });

module.exports = mongoose.model('Procurement', procurementSchema);
