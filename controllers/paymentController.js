// controllers/paymentController.js
import dotenv from "dotenv";
dotenv.config();

import Razorpay from "razorpay";
import Order from "../models/Order.js";
import { sendOrderNotifications } from "../utils/notificationService.js";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  throw new Error("RAZORPAY_KEY_ID or RAZORPAY_SECRET missing from .env");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ========== RAZORPAY ==========
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

// ========== COD ORDER WITH NOTIFICATIONS ==========
export const createCODOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod, totalAmount } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }

    if (!shippingAddress || !shippingAddress.name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Shipping address required hai' 
      });
    }

    // New Order create karo
    const newOrder = new Order({
      user: userId,
      customerDetails: {
        name: shippingAddress.name,
        email: shippingAddress.email || '',
        number: shippingAddress.phone,
        address1: shippingAddress.address || '',
        address2: shippingAddress.address2 || '',
        pincode: shippingAddress.pincode || '',
        location: shippingAddress.city || ''
      },
      items: items,
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        pincode: shippingAddress.pincode,
        phone: shippingAddress.phone
      },
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      totalAmount: totalAmount,
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();
    console.log('✅ COD Order saved:', savedOrder._id);

    // ========== SEND NOTIFICATIONS ==========
    const notificationData = {
      orderId: savedOrder._id,
      customerName: shippingAddress.name,
      customerEmail: shippingAddress.email,
      customerPhone: shippingAddress.phone,
      totalAmount: totalAmount,
      items: items,
      paymentMethod: 'COD'
    };

    // Send email & SMS (async - won't block response)
    sendOrderNotifications(notificationData).catch(err => {
      console.error('Notification error:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'COD Order placed successfully',
      orderId: savedOrder._id,
      order: savedOrder
    });

  } catch (error) {
    console.error('❌ COD Order Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create order',
      error: error.message 
    });
  }
};

// ========== CUSTOMER FORM CONTROLLER ==========
export const createCustomer = async (req, res) => {
  try {
    const { name, email, number, address1, address2, pincode, location } = req.body;

    if (!name || !email || !number || !address1 || !address2 || !pincode || !location) {
      return res.status(400).json({
        success: false,
        message: 'Sab fields required hain'
      });
    }

    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!/^\d{10}$/.test(number)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number 10 digits hona chahiye'
      });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Pincode 6 digits hona chahiye'
      });
    }

    console.log('✅ Customer details validated:', { name, email, number, pincode });

    return res.status(200).json({
      success: true,
      message: 'Customer details received successfully',
      data: {
        name,
        email,
        number,
        address1,
        address2,
        pincode,
        location
      }
    });

  } catch (error) {
    console.error('❌ Customer form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing customer details',
      error: error.message
    });
  }
};

// ========== DELETE ORDER ==========
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findByIdAndDelete(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      deletedOrder: order
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
    
  }
};