const express = require('express');
const router = express.Router();
const CCTVProduct = require('../models/CCTVProduct');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// Get all CCTV products
router.get('/', async (req, res) => {
    try {
        const products = await CCTVProduct.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific product
router.get('/:id', async (req, res) => {
    try {
        const product = await CCTVProduct.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new CCTV product
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const productData = {
            ...req.body,
            image: req.file ? `/uploads/cctv/${req.file.filename}` : undefined
        };

        const product = new CCTVProduct(productData);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update CCTV product
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const productData = {
            ...req.body,
            image: req.file ? `/uploads/cctv/${req.file.filename}` : undefined
        };

        const product = await CCTVProduct.findByIdAndUpdate(
            req.params.id,
            productData,
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete CCTV product
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await CCTVProduct.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 