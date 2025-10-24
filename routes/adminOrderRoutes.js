import express from "express";
import { getAllOrders, getOrderById } from "../controllers/adminOrderController.js";
import { deleteOrder } from "../controllers/paymentController.js";

const router = express.Router();

// Get all orders
router.get("/all", getAllOrders);

// Get single order by ID
router.get("/:orderId", getOrderById);

// Delete order by ID
router.delete("/:orderId", deleteOrder);




export default router;