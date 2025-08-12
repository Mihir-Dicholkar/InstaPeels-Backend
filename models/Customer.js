import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String, required: true },
    pincode: { type: String, required: true },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
