import dotenv from "dotenv";
import mongoose from "mongoose";
import { ProductModel } from "../modules/product/infrastructure/product.schema.js";

dotenv.config();

const migrate = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MONGO_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const cursor = ProductModel.collection.find({
    variants: { $exists: true },
    colorOptions: { $exists: false },
  });

  let migrated = 0;

  for await (const doc of cursor) {
    await ProductModel.collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          colorOptions: [
            { _id: new mongoose.Types.ObjectId(), variants: doc.variants ?? [] },
          ],
        },
        $unset: { variants: "" },
      },
    );
    migrated++;
  }

  console.log(`✅ Migrated ${migrated} product(s) to colorOptions shape.`);
  await mongoose.disconnect();
};

migrate().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
