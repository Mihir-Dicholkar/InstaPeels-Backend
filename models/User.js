// models/User.js
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  code: String,
  expiresAt: Date,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true }, // optional + sparse
    mobile: { type: String, unique: true, required: true }, // main unique field
    password: { type: String },
    isAdmin: { type: Boolean, default: false },
    otp: otpSchema, // 🔗 Embedded subdocument
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
