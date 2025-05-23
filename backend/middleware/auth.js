const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        console.log('Token:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Decoded user:', decoded);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new Error('User not found');
        }
        
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth error:', err);
        res.status(401).json({ message: 'Please authenticate' });
    }
}; 