import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { UserModel } from "../modules/user/infrastructure/user.schema.js";

dotenv.config();

const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
const adminName = process.env.ADMIN_NAME || "Super Admin";

const seedAdmin = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MONGO_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const existingAdmin = await UserModel.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log(`ℹ️ Admin already exists: ${adminEmail}`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await UserModel.create({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
    isVerified: true,
    isBlocked: false,
    tokenVersion: 0,
  });

  console.log(`✅ Admin created: ${admin.email}`);
  await mongoose.disconnect();
};

seedAdmin().catch((error) => {
  console.error("❌ Failed to seed admin:", error);
  process.exit(1);
});
