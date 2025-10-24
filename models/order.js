import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  customerDetails: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    },
    address1: {
      type: String,
      required: true
    },
    address2: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    }
  },
  items: [{
    productId: String,
    title: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  shippingAddress: {
    address: String,
    city: String,
    pincode: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    default: 'Confirmed'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Order', orderSchema);