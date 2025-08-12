import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  code: String,
  expiresAt: Date,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobile: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false },
  otp: otpSchema, // 🔗 Embedded subdocument
});

export default mongoose.model('User', userSchema);
