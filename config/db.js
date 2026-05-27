import mongoose from "mongoose";
import { mongodbUri } from "./index.js";

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log("📦 Using existing database connection");
    return;
  }

  try {        
    await mongoose.connect(mongodbUri);
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error; // Rethrow so the server can handle it
  }
}

// Optional: graceful shutdown
export async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log("📦 MongoDB disconnected");
}
