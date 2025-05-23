const express = require('express');
const router = express.Router();
const InternetPackage = require('../models/InternetPackage');
const auth = require('../middleware/auth');

// Get all internet packages
router.get('/', async (req, res) => {
    try {
        const packages = await InternetPackage.find({ isActive: true });
        res.json(packages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific package
router.get('/:id', async (req, res) => {
    try {
        const package = await InternetPackage.findById(req.params.id);
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.json(package);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new package (protected route)
router.post('/', auth, async (req, res) => {
    const package = new InternetPackage({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        type_detail: req.body.type_detail,
        features: req.body.features,
        specifications: req.body.specifications,
        isActive: req.body.isActive
    });

    try {
        const newPackage = await package.save();
        res.status(201).json(newPackage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a package (protected route)
router.patch('/:id', auth, async (req, res) => {
    try {
        const package = await InternetPackage.findById(req.params.id);
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        Object.keys(req.body).forEach(key => {
            package[key] = req.body[key];
        });

        const updatedPackage = await package.save();
        res.json(updatedPackage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a package (protected route)
router.delete('/:id', auth, async (req, res) => {
    try {
        const package = await InternetPackage.findById(req.params.id);
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        package.isActive = false;
        await package.save();
        res.json({ message: 'Package deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 