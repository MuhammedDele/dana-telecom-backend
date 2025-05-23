const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const upload = require('./middleware/upload');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const internetPackagesRouter = require('./routes/internetPackages');
const cctvProductsRouter = require('./routes/cctvProducts');
const nanoBeamProductsRouter = require('./routes/nanoBeamProducts');
const authRouter = require('./routes/auth');
const newsRouter = require('./routes/news');

// Apply routes
app.use('/api/internet-packages', internetPackagesRouter);
app.use('/api/cctv-products', cctvProductsRouter);
app.use('/api/nanobeam-products', nanoBeamProductsRouter);
app.use('/api/auth', authRouter);
app.use('/api/news', newsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mld', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 