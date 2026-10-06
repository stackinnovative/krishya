import dotenv from "dotenv";
import mongoose from "mongoose";
import { ProductModel } from "../modules/product/infrastructure/product.schema.js";

dotenv.config();

/** Backfills defaultVariantId/defaultPrice for products created before the admin-picked-default-variant feature, choosing the cheapest active in-stock variant (falling back to cheapest overall) - the same variant that was already driving their displayed price via the old startingFrom field, so no price changes visibly until an admin picks a different default. */
const migrate = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MONGO_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const cursor = ProductModel.collection.find({});

  let updatedProducts = 0;
  let skippedNoVariants = 0;

  for await (const doc of cursor) {
    const allVariants = (doc.colorOptions ?? []).flatMap((c: any) => c.variants ?? []);
    if (allVariants.length === 0) {
      skippedNoVariants++;
      continue;
    }

    const inStockActive = allVariants.filter(
      (v: any) => v.isActive !== false && (v.stock ?? 0) > 0,
    );
    const pool = inStockActive.length > 0 ? inStockActive : allVariants;
    const chosen = pool.reduce((min: any, v: any) => (v.price < min.price ? v : min), pool[0]);

    await ProductModel.collection.updateOne(
      { _id: doc._id },
      { $set: { defaultVariantId: chosen._id, defaultPrice: chosen.price } },
    );
    updatedProducts++;
  }

  console.log(`✅ Backfilled defaultVariantId/defaultPrice on ${updatedProducts} product(s).`);
  if (skippedNoVariants) console.log(`⚠️ Skipped ${skippedNoVariants} product(s) with no variants.`);
  await mongoose.disconnect();
};

migrate().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
