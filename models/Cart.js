import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  products: [
    {
      productId: String,
      title: String,
      price: Number,
      image: String,
      quantity: Number,
    }
  ],
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);
