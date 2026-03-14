import express from 'express';
import multer from 'multer';
import path from 'path';
import Notice from '../models/Notice.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only images and documents are allowed!');
    }
  },
});

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      return next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// @route   GET /api/notices
// @desc    Get all notices
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        
        // Students only see approved notices
        if (req.user.role === 'student') {
            query.status = 'approved';
        } 
        // Faculty see all notices but we'll handle status display in frontend
        // HOD sees everything
        
        const notices = await Notice.find(query).populate('author', 'name email').sort({ createdAt: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/notices
// @desc    Create a notice (Faculty & HOD only)
router.post('/', protect, upload.single('attachment'), async (req, res) => {
    if (req.user.role !== 'faculty' && req.user.role !== 'hod') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, category, department } = req.body;

    try {
        const notice = new Notice({
            title,
            content,
            category,
            department: department || 'All',
            author: req.user._id,
            attachment: req.file ? `/uploads/${req.file.filename}` : null,
            // HOD posts are auto-approved, faculty posts are pending
            status: req.user.role === 'hod' ? 'approved' : 'pending'
        });

        const createdNotice = await notice.save();
        res.status(201).json(createdNotice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/notices/:id
// @desc    Delete a notice (Faculty only)
router.delete('/:id', protect, async (req, res) => {
    if (req.user.role !== 'faculty') {
        return res.status(403).json({ message: 'Not authorized as faculty' });
    }

    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        // For this hackathon project, allow any faculty to delete any notice
        // This avoids issues during testing if different accounts were used
        await notice.deleteOne();
        res.json({ message: 'Notice removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/notices/:id/status
// @desc    Update notice status (HOD only)
router.put('/:id/status', protect, async (req, res) => {
    if (req.user.role !== 'hod') {
        return res.status(403).json({ message: 'Not authorized as HOD' });
    }

    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        notice.status = status;
        await notice.save();
        res.json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
