import { Nitro } from "nitropack";
import mongoose from "mongoose";

export default async (_nitroApp: Nitro) => {
  const config = useRuntimeConfig();

  try {
    await mongoose.connect(config.mongodbUri);

    const db = mongoose.connection;

    db.on("connected", () => {
      console.log("✅ Successfully connected to MongoDB");
    });

    db.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    db.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected.");
    });

  } catch (error) {
    console.error("❌ Initial connection attempt failed:", error);
  }
};
