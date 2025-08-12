import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import productRoutes from "./routes/products.js";
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js';
import cartRoutes from './routes/cart.js';
  import messageRoutes from './routes/messages.js';
import customerRoutes from "./routes/customerRoutes.js";
import companyRoutes from './routes/companyRoutes.js';
  import path from 'path';
  import reviewRoutes from './routes/reviews.js';
  import blogRoutes from './routes/blogs.js'
  import { fileURLToPath } from 'url';
  import paymentRoutes from './routes/paymentRoutes.js';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ IMPORTANT for form-data
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); //✅ Serve uploaded files
app.use("/api/auth", authRoutes)
app.use('/api/reviews', reviewRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/customers", customerRoutes);
app.use('/api/payment', paymentRoutes);
// Routes
app.use("/api/products", productRoutes);
 
app.use('/api/companies', companyRoutes);// <-- NEW
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/InstaPeels")
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));


app.use('/api/messages', messageRoutes);
