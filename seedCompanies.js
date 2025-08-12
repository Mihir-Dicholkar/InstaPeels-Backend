import mongoose from "mongoose";
import dotenv from "dotenv";
import Company from "./models/Company.js";

dotenv.config();

const companies = [
  { name: "InstaPeels" },
  { name: "DermaFly" },
  { name: "Viberissa" }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    await Company.deleteMany();
    await Company.insertMany(companies);
    console.log("✅ Companies seeded!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}
seed();
