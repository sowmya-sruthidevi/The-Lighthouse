import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, accessCode } = req.body;

  try {
    // Verify Access Code for Faculty and HOD
    if (role === 'faculty') {
      if (accessCode !== process.env.FACULTY_SECRET_CODE) {
        return res.status(401).json({ message: 'Invalid Faculty Access Code' });
      }
    } else if (role === 'hod') {
      if (accessCode !== process.env.HOD_SECRET_CODE) {
        return res.status(401).json({ message: 'Invalid HOD Access Code' });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, role, accessCode } = req.body;

  try {
    // Verify Access Code for Faculty and HOD during login for extra security
    if (role === 'faculty') {
      if (accessCode !== process.env.FACULTY_SECRET_CODE) {
        return res.status(401).json({ message: 'Invalid Faculty Access Code' });
      }
    } else if (role === 'hod') {
        if (accessCode !== process.env.HOD_SECRET_CODE) {
            return res.status(401).json({ message: 'Invalid HOD Access Code' });
        }
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Allow faculty to login to faculty portal, student to student
      if (role && user.role !== role) {
          return res.status(401).json({ message: `Incorrect portal for ${user.role} role.` });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
