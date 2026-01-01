const express = require('express');
const router = express.Router();
const Procurement = require('../models/Procurement');

// POST / - Request an item
router.post('/', async (req, res) => {
    try {
        const newRequest = new Procurement(req.body);
        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET / - View procurement requests
router.get('/', async (req, res) => {
    try {
        const requests = await Procurement.find();
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /:id - Update procurement request
router.put('/:id', async (req, res) => {
    try {
        const updatedRequest = await Procurement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /:id - Delete procurement request
router.delete('/:id', async (req, res) => {
    try {
        await Procurement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Request deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /bulk-delete - Bulk delete requests
router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await Procurement.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Requests deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
