const express = require('express');
const router = express.Router();
const News = require('../models/News');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const mongoose = require('mongoose');

// Get all published news posts (public)
router.get('/', async (req, res) => {
    try {
        const news = await News.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .populate('author', 'firstName lastName')
            .populate('comments.user', 'firstName lastName')
            .populate('comments.replies.user', 'firstName lastName');
        res.json(news);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific news post (public)
router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching news post with ID:', req.params.id);
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid news post ID' });
        }

        const news = await News.findById(req.params.id)
            .populate('author', 'firstName lastName')
            .populate('comments.user', 'firstName lastName')
            .populate('comments.replies.user', 'firstName lastName');

        console.log('Found news post:', news);

        if (!news) {
            return res.status(404).json({ message: 'News post not found' });
        }

        res.json(news);
    } catch (err) {
        console.error('Error fetching news post:', err);
        res.status(500).json({ message: err.message });
    }
});

// Create new news post (admin only)
router.post('/', [auth, checkRole('admin'), upload.single('image')], async (req, res) => {
    try {
        const newsData = {
            ...req.body,
            image: req.file ? `/uploads/news/${req.file.filename}` : undefined,
            author: req.user._id
        };

        const news = new News(newsData);
        await news.save();
        res.status(201).json(news);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update news post (admin only)
router.put('/:id', [auth, checkRole('admin'), upload.single('image')], async (req, res) => {
    try {
        const newsData = {
            ...req.body,
            image: req.file ? `/uploads/news/${req.file.filename}` : undefined
        };

        const news = await News.findByIdAndUpdate(
            req.params.id,
            newsData,
            { new: true }
        );
        
        if (!news) {
            return res.status(404).json({ error: 'News post not found' });
        }
        
        res.json(news);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete news post (admin only)
router.delete('/:id', [auth, checkRole('admin')], async (req, res) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);
        if (!news) {
            return res.status(404).json({ error: 'News post not found' });
        }
        res.json({ message: 'News post deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Like/Unlike a news post (authenticated users)
router.post('/:id/like', auth, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ error: 'News post not found' });
        }

        const likeIndex = news.likes.indexOf(req.user._id);
        if (likeIndex === -1) {
            news.likes.push(req.user._id);
        } else {
            news.likes.splice(likeIndex, 1);
        }

        await news.save();
        res.json(news);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a comment to a news post (authenticated users)
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ error: 'News post not found' });
        }

        news.comments.push({
            user: req.user._id,
            content: req.body.content
        });

        await news.save();
        const populatedNews = await News.findById(news._id)
            .populate('author', 'firstName lastName')
            .populate('comments.user', 'firstName lastName')
            .populate('comments.replies.user', 'firstName lastName');
        res.json(populatedNews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a comment (admin or comment author)
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
    try {
        console.log('Attempting to delete comment:', {
            newsId: req.params.id,
            commentId: req.params.commentId
        });

        const news = await News.findById(req.params.id);
        if (!news) {
            console.log('News not found:', req.params.id);
            return res.status(404).json({ error: 'News post not found' });
        }

        const comment = news.comments.id(req.params.commentId);
        if (!comment) {
            console.log('Comment not found:', req.params.commentId);
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (req.user.role !== 'admin' && comment.user.toString() !== req.user._id.toString()) {
            console.log('User not authorized:', {
                userRole: req.user.role,
                userId: req.user._id,
                commentUserId: comment.user
            });
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        // Remove the comment
        news.comments.pull(req.params.commentId);
        await news.save();

        // Fetch the updated news post with populated data
        const updatedNews = await News.findById(req.params.id)
            .populate('author', 'firstName lastName')
            .populate('comments.user', 'firstName lastName')
            .populate('comments.replies.user', 'firstName lastName');

        console.log('Comment deleted successfully');
        res.json(updatedNews);
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add a reply to a comment
router.post('/:id/comment/:commentId/reply', auth, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ error: 'News post not found' });
        }

        const comment = news.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comment.replies.push({
            user: req.user._id,
            content: req.body.content
        });

        await news.save();
        const populatedNews = await News.findById(news._id)
            .populate('author', 'firstName lastName')
            .populate('comments.user', 'firstName lastName')
            .populate('comments.replies.user', 'firstName lastName');
        res.json(populatedNews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a reply (admin or reply author)
router.delete('/:id/comment/:commentId/reply/:replyId', auth, async (req, res) => {
    try {
        console.log('Attempting to delete reply:', {
            newsId: req.params.id,
            commentId: req.params.commentId,
            replyId: req.params.replyId
        });

        const news = await News.findById(req.params.id);
        if (!news) {
            console.log('News not found:', req.params.id);
            return res.status(404).json({ error: 'News post not found' });
        }

        const comment = news.comments.id(req.params.commentId);
        if (!comment) {
            console.log('Comment not found:', req.params.commentId);
            return res.status(404).json({ error: 'Comment not found' });
        }

        const reply = comment.replies.id(req.params.replyId);
        if (!reply) {
            console.log('Reply not found:', req.params.replyId);
            return res.status(404).json({ error: 'Reply not found' });
        }

        if (req.user.role !== 'admin' && reply.user.toString() !== req.user._id.toString()) {
            console.log('User not authorized:', {
                userRole: req.user.role,
                userId: req.user._id,
                replyUserId: reply.user
            });
            return res.status(403).json({ error: 'Not authorized to delete this reply' });
        }

        // Remove the reply
        comment.replies.pull(req.params.replyId);
        await news.save();

        // Fetch the updated news post with populated data
        const updatedNews = await News.findById(req.params.id)
            .populate('author', 'firstName lastName')
            .populate('comments.user', 'firstName lastName')
            .populate('comments.replies.user', 'firstName lastName');

        console.log('Reply deleted successfully');
        res.json(updatedNews);
    } catch (err) {
        console.error('Error deleting reply:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 