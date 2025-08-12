import Customer from "../models/Customer.js";

export const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ message: "Customer saved", customer });
  } catch (error) {
    console.error("Error saving customer:", error);
    res.status(500).json({ message: "Server error" });
  }
};
