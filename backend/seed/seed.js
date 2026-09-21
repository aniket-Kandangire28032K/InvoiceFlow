import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import User from "../model/User.js";
import bcrypt from "bcryptjs";

configDotenv();


const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    // Remove existing users
    await User.deleteMany({});

    // Hash passwords
    const password = await bcrypt.hash("password123", 10);

    // Demo users
    const users = [
      {
        name: "Admin User",
        email: "admin@invoiceflow.com",
        password,
      },
      {
        name: "Demo User",
        email: "demo@invoiceflow.com",
        password,
      },
    ];

    await User.insertMany(users);

    console.log("Users seeded successfully");
    console.log("Demo login:");
    console.log("Email: admin@invoiceflow.com");
    console.log("Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedUsers();