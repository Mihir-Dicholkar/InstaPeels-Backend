// routes/users.js

import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// DELETE user by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

router.get('/count', async (req, res) => {
  try {
    const count = await User.countDocuments({ isAdmin: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to count users" });
  }
});


export default router; // ✅ This line fixes the error
