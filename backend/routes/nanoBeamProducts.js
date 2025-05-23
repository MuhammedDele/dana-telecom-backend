const express = require('express');
const router = express.Router();
const NanoBeamProduct = require('../models/NanoBeamProduct');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// Get all NanoBeam products
router.get('/', async (req, res) => {
    try {
        const products = await NanoBeamProduct.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific product
router.get('/:id', async (req, res) => {
    try {
        const product = await NanoBeamProduct.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new NanoBeam product
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const productData = {
            ...req.body,
            image: `/uploads/nanobeam/${req.file.filename}`
        };

        // Validate required fields
        if (!productData.title || !productData.description || !productData.price || !productData.type_detail) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const product = new NanoBeamProduct(productData);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        console.error('Error creating NanoBeam product:', err);
        res.status(500).json({ 
            error: 'Failed to create product',
            details: err.message 
        });
    }
});

// Update NanoBeam product
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const productData = {
            ...req.body,
            image: req.file ? `/uploads/nanobeam/${req.file.filename}` : undefined
        };

        const product = await NanoBeamProduct.findByIdAndUpdate(
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

// Delete NanoBeam product
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await NanoBeamProduct.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 