const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');

router.post('/', async (req, res) => {
    try {
        const item = new Evaluation(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const items = await Evaluation.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const item = await Evaluation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Evaluation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await Evaluation.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Evaluations deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
