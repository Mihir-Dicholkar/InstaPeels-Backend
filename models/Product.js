// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  images: [String],
  imgSrc: String,

  // New skincare-specific fields
  howToUse: { type: String }, // e.g. "Apply twice daily on cleansed face."
  benefits: { type: [String] }, // e.g. ["Hydrates skin", "Reduces fine lines"]
  ingredients: { type: [String] }, // e.g. ["Aloe Vera", "Vitamin C", "Hyaluronic Acid"]

}, { timestamps: true });

export default mongoose.model("Product", productSchema);
