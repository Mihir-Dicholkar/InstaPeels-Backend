// routes/products.js
import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import upload from "../upload.js";

const router = express.Router();

// Multer fields config
const uploadFields = upload.fields([
  { name: "images", maxCount: 6 },
  { name: "headingImage", maxCount: 1 },
  { name: "descriptionImage", maxCount: 1 },
  { name: "ingredientsImage", maxCount: 1 },
  { name: "howToUseImage", maxCount: 1 },
  { name: "suitableForImage", maxCount: 1 },
  { name: "benefitsImage", maxCount: 1 },
]);

// ✅ POST: Add Product
router.post("/", uploadFields, async (req, res) => {
  try {
    const { title, size, price, cutPrice, addto, outof, rating, company, description, ingredients, howToUse, suitableFor, benefits } = req.body;

    // addto is now optional - removed from required fields check
    if (!title || !size || !price || !company)
      return res.status(400).json({ error: "Title, size, price, and company are required." });

    const product = new Product({
      title,
      size,
      price,
      cutPrice,
      addto: addto || "",
      outof: outof || "", // Optional field with default empty string
      rating: rating || 0,
      company,
      description: description || "",
      ingredients: ingredients || "",
      howToUse: howToUse || "",
      suitableFor: suitableFor || "",
      benefits: benefits || "",
      images: req.files.images?.map(f => `/uploads/${f.filename}`) || [],
      imgSrc: req.files.images?.[0] ? `/uploads/${req.files.images[0].filename}` : null,
      headingImage: req.files.headingImage?.[0] ? `/uploads/${req.files.headingImage[0].filename}` : null,
      descriptionImage: req.files.descriptionImage?.[0] ? `/uploads/${req.files.descriptionImage[0].filename}` : null,
      ingredientsImage: req.files.ingredientsImage?.[0] ? `/uploads/${req.files.ingredientsImage[0].filename}` : null,
      howToUseImage: req.files.howToUseImage?.[0] ? `/uploads/${req.files.howToUseImage[0].filename}` : null,
      suitableForImage: req.files.suitableForImage?.[0] ? `/uploads/${req.files.suitableForImage[0].filename}` : null,
      benefitsImage: req.files.benefitsImage?.[0] ? `/uploads/${req.files.benefitsImage[0].filename}` : null,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("POST /products error:", err);
    res.status(500).json({ error: "Failed to add product." });
  }
});

// ✅ GET: All Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("company");
    res.json(products);
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

// ✅ GET: Product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("company");
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (err) {
    console.error("GET /products/:id error:", err);
    res.status(500).json({ message: "Failed to fetch product." });
  }
});

// ✅ PUT: Update Product
router.put("/:id", uploadFields, async (req, res) => {
  try {
    const { title, size, price, cutPrice, addto, outof, rating, company, description, ingredients, howToUse, suitableFor, benefits } = req.body;

    const updateData = {
      title,
      size,
      price,
      cutPrice,
      addto: addto || "",
       outof: outof || "", // Optional field with default empty string
      rating: rating || 0,
      company,
      description: description || "",
      ingredients: ingredients || "",
      howToUse: howToUse || "",
      suitableFor: suitableFor || "",
      benefits: benefits || "",
    };

    // Update images if uploaded
    if (req.files.images?.length) {
      updateData.images = req.files.images.map(f => `/uploads/${f.filename}`);
      updateData.imgSrc = updateData.images[0];
    }
    
    // Handle all image uploads from req.files
    if (req.files.headingImage) updateData.headingImage = `/uploads/${req.files.headingImage[0].filename}`;
    if (req.files.descriptionImage) updateData.descriptionImage = `/uploads/${req.files.descriptionImage[0].filename}`;
    if (req.files.ingredientsImage) updateData.ingredientsImage = `/uploads/${req.files.ingredientsImage[0].filename}`;
    if (req.files.howToUseImage) updateData.howToUseImage = `/uploads/${req.files.howToUseImage[0].filename}`;
    if (req.files.suitableForImage) updateData.suitableForImage = `/uploads/${req.files.suitableForImage[0].filename}`;
    if (req.files.benefitsImage) updateData.benefitsImage = `/uploads/${req.files.benefitsImage[0].filename}`;

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: "Product not found." });

    res.json(updated);
  } catch (err) {
    console.error("PUT /products/:id error:", err);
    res.status(500).json({ error: "Failed to update product." });
  }
});

// ✅ DELETE: Delete Product
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found." });
    res.json({ message: "Product deleted successfully." });
  } catch (err) {
    console.error("DELETE /products/:id error:", err);
    res.status(500).json({ error: "Failed to delete product." });
  }
});

// ✅ GET: Products by Company
router.get("/company/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const products = await Product.find({ company: companyId }).populate("company");
    if (!products || products.length === 0)
      return res.status(404).json({ message: "No products found for this company." });

    res.json(products);
  } catch (err) {
    console.error("GET /products/company/:companyId error:", err);
    res.status(500).json({ message: "Failed to fetch company products." });
  }
});

export default router;