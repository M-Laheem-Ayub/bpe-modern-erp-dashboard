const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware);

// POST /api/inventory - Add a new inventory item
router.post('/', async (req, res) => {
    try {
        const newItem = new Inventory(req.body);
        const savedItem = await newItem.save();

        // Create Notification (assuming req.user is available via authMiddleware)
        // Note: This route doesn't seem to have authMiddleware yet?
        // Let's check imports. Just in case, we will wrap in try-catch or ensure user exists.
        // Actually, normally req.user is added by middleware. If this route is public, we can't notify 'the user'.
        // But let's assume it will be protected or we find the admin user.
        // For now, let's just leave it, or better:
        // If we have req.user (from authMiddleware), notify them.

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

// GET /api/inventory - Fetch all inventory items
router.get('/', async (req, res) => {
    try {
        const items = await Inventory.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Item
router.put('/:id', async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Item
router.delete('/:id', async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk Delete
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
