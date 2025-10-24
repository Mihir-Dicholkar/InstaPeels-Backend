// routes/companyRoutes.js
import express from 'express';
import Company from '../models/Company.js';

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies); // ✅ returns an array directly
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch companies" });
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
