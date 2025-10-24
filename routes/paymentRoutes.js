import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import { createCODOrder } from "../controllers/paymentController.js";
import { sendOrderNotifications } from "../utils/notificationService.js";

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ========== CREATE RAZORPAY ORDER ==========
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).send("Error creating Razorpay order");
  }
});

// ========== VERIFY PAYMENT WITH NOTIFICATIONS ==========
router.post("/verify-payment", async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId, 
      items, 
      shippingAddress, 
      totalAmount, 
      customerData 
    } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      const Order = (await import("../models/Order.js")).default;

      // Create order
      const newOrder = new Order({
        user: userId || "guest",
        customerDetails: {
          name: customerData?.name || shippingAddress?.name,
          email: customerData?.email || shippingAddress?.email,
          number: customerData?.number || shippingAddress?.phone,
          address1: customerData?.address1 || shippingAddress?.address,
          address2: customerData?.address2 || shippingAddress?.address2,
          pincode: customerData?.pincode || shippingAddress?.pincode,
          location: customerData?.location || shippingAddress?.city
        },
        items: items,
        shippingAddress: {
          address: shippingAddress?.address,
          city: shippingAddress?.city,
          pincode: shippingAddress?.pincode,
          phone: shippingAddress?.phone
        },
        paymentMethod: "Razorpay",
        paymentStatus: "Completed",
        orderStatus: "Confirmed",
        totalAmount: totalAmount,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        createdAt: new Date()
      });

      const savedOrder = await newOrder.save();
      console.log("✅ Payment verified and saved:", savedOrder._id);

      // ========== SEND NOTIFICATIONS ==========
      const notificationData = {
        orderId: savedOrder._id,
        customerName: customerData?.name || shippingAddress?.name,
        customerEmail: customerData?.email || shippingAddress?.email,
        customerPhone: customerData?.number || shippingAddress?.phone,
        totalAmount: totalAmount,
        items: items,
        paymentMethod: 'Razorpay'
      };

      // Send email & SMS (async)
      sendOrderNotifications(notificationData).catch(err => {
        console.error('Notification error:', err);
      });

      res.json({ 
        success: true, 
        message: "Payment verified successfully and saved to database",
        orderId: savedOrder._id,
        paymentId: razorpay_payment_id
      });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ success: false, message: "Error verifying payment", error: err.message });
  }
});

// ========== COD ROUTE ==========
router.post("/create-cod-order", createCODOrder);

export default router;
