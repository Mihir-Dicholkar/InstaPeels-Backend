import express from 'express';
import multer from 'multer';
import Blog from '../models/Blogs.js';
import Blogs from '../models/Blogs.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // upload to this folder
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Add blog
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, link } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const blog = new Blog({ title, image, description, link });
    await blog.save();

    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add blog' });
  }
});

router.get("/count", async (req, res) => {
  try {
    const count = await Blogs.countDocuments();
    console.log("Count:", count); // ✅ log count
    res.json({ count });
  } catch (err) {
    console.error("Error fetching product count:", err); // ✅ log error
    res.status(500).json({ message: "Failed to count products" });
  }
});

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Delete blog
router.delete('/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});


// In routes/blogs.js
router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        link: req.body.link,
        ...(req.file && { image: `/uploads/${req.file.filename}` }),
      },
      { new: true }
    );
    if (!updatedBlog) return res.status(404).send("Blog not found");
    res.status(200).json(updatedBlog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
