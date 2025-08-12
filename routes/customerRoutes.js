import express from "express";
import { createCustomer } from "../controllers/customerController.js";

const router = express.Router();

router.post("/create", createCustomer);

export default router; // ✅ FIXED
