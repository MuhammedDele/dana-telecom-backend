const mongoose = require('mongoose');

const nanoBeamProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    type_detail: {
        type: String,
        required: true,
        enum: ['nanobeam', 'nanostation', 'powerbeam', 'airmax']
    },
    features: {
        type: [String],
        default: []
    },
    specifications: {
        type: Map,
        of: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
nanoBeamProductSchema.index({ type_detail: 1, title: 1 });

module.exports = mongoose.model('NanoBeamProduct', nanoBeamProductSchema); 