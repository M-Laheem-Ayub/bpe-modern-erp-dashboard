const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    employeeName: { type: String, required: true },
    reviewPeriod: { type: String, required: true },
    score: { type: Number, required: true },
    comments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
