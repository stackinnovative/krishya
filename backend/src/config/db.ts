import mongoose from "mongoose";
import { env } from "./env.js";

/** Atlas (and many networks) silently drop idle connections; without these
 * listeners a dropped connection was invisible and the next query would
 * just hang until the driver's 30s default server-selection timeout. */
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected");
    console.log(mongoose.connection.host);
    console.log(mongoose.connection.name);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    // Rethrow so main.ts's startServer() catch block actually sees this and
    // exits - swallowing it here previously meant the server would still
    // bind the port and accept requests with no working database.
    throw error;
  }
};
