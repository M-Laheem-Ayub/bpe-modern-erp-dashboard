const express = require('express');
const router = express.Router();
const JobApplication = require('../models/JobApplication');

// POST / - Apply for a job
router.post('/', async (req, res) => {
    try {
        const newApplication = new JobApplication(req.body);
        const savedApplication = await newApplication.save();
        res.status(201).json(savedApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET / - View all applications
router.get('/', async (req, res) => {
    try {
        const applications = await JobApplication.find();
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /:id - Update application
router.put('/:id', async (req, res) => {
    try {
        const updatedApp = await JobApplication.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedApp);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /:id - Delete application
router.delete('/:id', async (req, res) => {
    try {
        await JobApplication.findByIdAndDelete(req.params.id);
        res.json({ message: 'Application deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /bulk-delete - Delete multiple applications
router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await JobApplication.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Applications deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
