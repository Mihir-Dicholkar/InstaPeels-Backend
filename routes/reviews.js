import express from 'express';
import multer from 'multer';
import Review from '../models/Review.js';

const router = express.Router();

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// POST /api/reviews — Submit a new review
router.post('/', upload.single('image'), async (req, res) => {
    console.log('BODY:', req.body);
console.log('FILE:', req.file);

  try {
    const { name, rating, review, userId } = req.body;
    const image = req.file?.filename || null;

    // Basic validation
    if (!name || !rating || !review || !userId) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newReview = new Review({ name, rating, review, image, userId });
    await newReview.save();

    res.status(201).json(newReview);
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ message: 'Failed to submit review', error: err.message });
  }
});



// GET /api/reviews — Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
});


export default router;
