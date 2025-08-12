import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// GET messages between two users
router.get('/:userId/:adminId', async (req, res) => {
  const { userId, adminId } = req.params;
 try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId }
      ]
    }).sort('timestamp');

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: 'Error loading messages' });
  }
});


// Send new message
router.post('/', async (req, res) => {
  const { senderId, receiverId, text } = req.body;

  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const newMessage = new Message({ senderId, receiverId, text });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Failed to send message:", err);
    res.status(500).json({ message: 'Server error while sending message.' });
  }
});


export default router;
