import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import cartRoutes from "./routes/cart.js";
import messageRoutes from "./routes/messages.js";
import customerRoutes from "./routes/customerRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import path from "path";
import reviewRoutes from "./routes/reviews.js";
import blogRoutes from "./routes/blogs.js";
import { fileURLToPath } from "url";
import paymentRoutes from "./routes/paymentRoutes.js";
import statsRoutes from "./routes/stats.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";

// ✅ PEHLE app initialize karo
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ List of allowed domains
const allowedOrigins = [
  "http://localhost:5173", // e.g. Vite
  "https://www.instapeels.com",
  "http://www.instapeels.com",
  "https://instapeels.com",
  "http://instapeels.com",
];

// ✅ Dynamic CORS check
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ ALL ROUTES - AB use karo
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/payment", paymentRoutes);           // ✅ COD create route
app.use("/api/orders", adminOrderRoutes);         // ✅ Orders fetch route
app.use("/api/products", productRoutes);
app.use("/api", statsRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 5000;

// ✅ MongoDB connection aur server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));