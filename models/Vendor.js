const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    vendorName: { type: String, required: true },
    serviceType: { type: String, required: true },
    contactEmail: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    status: {
        type: String,
        enum: ['Evaluated', 'Approved'],
        default: 'Evaluated'
    }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
