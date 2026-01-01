const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    currentStock: {
        type: Number,
        required: true
    },
    reorderPoint: {
        type: Number,
        default: 10
    },
    unitPrice: {
        type: Number,
        required: true
    },
    supplier: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
