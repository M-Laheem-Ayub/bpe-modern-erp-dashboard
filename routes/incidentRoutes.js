const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

router.post('/', async (req, res) => {
    try {
        const item = new Incident(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const items = await Incident.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const item = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Incident.findByIdAndDelete(req.params.id);
        res.json({ message: 'Incident deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await Incident.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Incidents deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
