const express = require('express');
const router = express.Router();
const Training = require('../models/Training');

router.post('/', async (req, res) => {
    try {
        const item = new Training(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const items = await Training.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const item = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Training.findByIdAndDelete(req.params.id);
        res.json({ message: 'Training deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await Training.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Trainings deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
