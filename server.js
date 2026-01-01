require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const jobRoutes = require('./routes/jobRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const crmRoutes = require('./routes/crmRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/smart_erp_db')
    .then(() => console.log('MongoDB connected to smart_erp_db'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.send('Smart ERP API is running');
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
