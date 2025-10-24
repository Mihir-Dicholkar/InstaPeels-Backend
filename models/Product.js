// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // size: { type: Number, required: true },
  size: { type: String, required: true },

  price: {
    type: Number,
    required: true, // required
    min: 0
  },
  cutPrice: {
    type: Number,
    required: false, // optional field
  },

  addto: { type: String, required: false },
  outof: { type: String, required: false },
  rating: { type: Number },

  // Reference to company
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

  // Product images
  images: [String],         // Multiple product images
  imgSrc: String,           // Primary image

  // Skincare-specific images 
   headingImage: String,
  descriptionImage: String,
  ingredientsImage: String,
  howToUseImage: String,
  suitableForImage: String,
  benefitsImage: String,

}, { timestamps: true });

export default mongoose.model("Product", productSchema);
