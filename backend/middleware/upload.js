const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureUploadDirs = () => {
    const dirs = ['uploads', 'uploads/cctv', 'uploads/nanobeam', 'uploads/news'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

// Call this when the middleware is initialized
ensureUploadDirs();

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine the upload directory based on the route
        let uploadPath = 'uploads/';
        if (req.baseUrl.includes('cctv')) {
            uploadPath += 'cctv/';
        } else if (req.baseUrl.includes('nanobeam')) {
            uploadPath += 'nanobeam/';
        } else if (req.baseUrl.includes('news')) {
            uploadPath += 'news/';
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create a unique filename using timestamp and original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload; 