import express from "express";
import Product from "../models/Product.js";
import upload from "../upload.js";
import mongoose from "mongoose";

const router = express.Router();

// POST: Add product
router.post("/", upload.array("images", 6), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      rating,
      company,
      howToUse,
      benefits,
      ingredients
    } = req.body;

    // Validation
    if (!title || !description || !price || !company || !req.files?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    const product = new Product({
      title,
      description,
      price,
      rating,
      company,
      howToUse,    // ✅ added
      benefits,    // ✅ added
      ingredients, // ✅ added
      images: imagePaths,
      imgSrc: imagePaths[0],
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("POST /products error:", err);
    res.status(500).json({ error: "Failed to save product" });
  }
});


// GET: All products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("company");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET: Product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Product not found." });
  }
});

// PUT: Update product
router.put("/:id", upload.array("images", 6), async (req, res) => {
  try {
    const { title, description, price, rating, company, howToUse, benefits, ingredients } = req.body;

    const updateData = { 
      title, 
      description, 
      price, 
      rating, 
      company, 
      howToUse, 
      benefits, 
      ingredients 
    };

    if (req.files?.length > 0) {
      const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
      updateData.images = imagePaths;
      updateData.imgSrc = imagePaths[0];
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).send("Failed to update product.");
  }
});


// DELETE: Product
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send("Product not found.");
    res.send("Product deleted successfully.");
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).send("Failed to delete product.");
  }
});

// GET: Product count
router.get("/count", async (req, res) => {
  try {
    const count = await Product.countDocuments();
    console.log("count:", count);
    res.json({ count });
  } catch (err) {
    console.error("Error fetching product count:", err); // ✅ log error
    res.status(500).json({ message: "Failed to count products" });
  }
});

// GET: Products by company
// GET /api/products/company/:id
router.get("/company/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id:", id);
    // const products = await Product.find({ company: new mongoose.Types.ObjectId(id)  });
    const products = await Product.find({
      company: new mongoose.Types.ObjectId(id),
    });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products by company:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/companies", async (req, res) => {
  try {
    const companies = await Company.find(); // From your Company model
    res.json(companies);
    console.log("Companies:", companies + JSON.stringify(companies));
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
