import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String }, // store image URL or path
  description: { type: String, required: true },
  link: { type: String },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Blog', blogSchema);
