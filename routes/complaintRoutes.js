const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// POST / - File a complaint
router.post('/', async (req, res) => {
    try {
        const newComplaint = new Complaint(req.body);
        const savedComplaint = await newComplaint.save();
        res.status(201).json(savedComplaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET / - View complaint tickets
router.get('/', async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Complaint
router.put('/:id', async (req, res) => {
    try {
        const updatedComplaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedComplaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Complaint
router.delete('/:id', async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ message: 'Complaint deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk Delete
router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await Complaint.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Complaints deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
