const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const newItem = new Inventory(req.body);
        const savedItem = await newItem.save();

        if (req.user) {
            await Notification.create({
                user: req.user.id,
                type: 'info',
                title: 'New Inventory Added',
                message: `${savedItem.name} has been added to inventory.`
            });
        }

        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const items = await Inventory.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await Inventory.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Items deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
