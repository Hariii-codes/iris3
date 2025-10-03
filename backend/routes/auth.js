import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register new user
router.post('/register', registerUser);

// Login user with iris data
router.post('/login', loginUser);

// Example protected route
router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'Protected profile route', user: req.user });
});

export default router;
