import User from '../models/userModel.js';
import { hashIris, compareIris } from '../utils/irisHash.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const { username, irisData } = req.body;
    const irisHash = hashIris(irisData); // convert iris scan to hash

    const newUser = await User.create({ username, irisHash });
    res.status(201).json({ message: 'User registered', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, irisData } = req.body;
    const user = await User.findOne({ username });

    if (!user || !compareIris(irisData, user.irisHash)) {
      return res.status(401).json({ message: 'Authentication failed. Please try again.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};
