import dotenv from "dotenv";
dotenv.config();

import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  throw new Error("RAZORPAY_KEY_ID or RAZORPAY_SECRET missing from .env");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt = `rcpt_${Date.now()}` } = req.body;
    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }
    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };
    const order = await razorpay.orders.create(options);
    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay order error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
