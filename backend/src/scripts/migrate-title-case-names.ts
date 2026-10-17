import dotenv from "dotenv";
import mongoose from "mongoose";
import { CategoryModel } from "../modules/category/infrastructure/category.schema.js";
import { ProductModel } from "../modules/product/infrastructure/product.schema.js";
import { toTitleCase } from "../core/utils/to.title.case.helper.js";

dotenv.config();

// One-off: Title Case the category, product and ingredient names saved before
// the DTOs started normalising them. Slugs are left alone so links keep working.
const migrateTitleCaseNames = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MONGO_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  let categoryCount = 0;
  const categories = await CategoryModel.find({}, { name: 1 }).lean();
  for (const category of categories) {
    const name = toTitleCase(category.name);
    if (name === category.name) continue;
    await CategoryModel.updateOne({ _id: category._id }, { $set: { name } });
    console.log(`✅ Category: ${category.name} -> ${name}`);
    categoryCount++;
  }

  let productCount = 0;
  const products = await ProductModel.find({}, { name: 1, ingredients: 1 }).lean();
  for (const product of products) {
    const name = toTitleCase(product.name);
    const ingredients = product.ingredients.map((i) => ({ ...i, name: toTitleCase(i.name) }));
    const ingredientsChanged = ingredients.some((i, idx) => i.name !== product.ingredients[idx]!.name);
    if (name === product.name && !ingredientsChanged) continue;
    await ProductModel.updateOne({ _id: product._id }, { $set: { name, ingredients } });
    console.log(`✅ Product: ${product.name} -> ${name}`);
    productCount++;
  }

  console.log(`\n✨ Done. Categories updated: ${categoryCount}, Products updated: ${productCount}`);
  await mongoose.disconnect();
};

migrateTitleCaseNames().catch((error) => {
  console.error("❌ Failed to migrate names:", error);
  process.exit(1);
});
