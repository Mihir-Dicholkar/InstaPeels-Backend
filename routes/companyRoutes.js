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

export default router;
