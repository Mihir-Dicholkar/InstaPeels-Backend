// routes/stats.js
import express from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Blog from "../models/Blogs.js";
import Review from "../models/Review.js";

const router = express.Router();

// Count products
router.get("/products/count", async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Count users
router.get("/users/count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Count blogs
router.get("/blogs/count", async (req, res) => {
  try {
    const count = await Blog.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Count reviews
router.get("/reviews/count", async (req, res) => {
  try {
    const count = await Review.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
