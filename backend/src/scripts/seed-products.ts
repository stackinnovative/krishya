import "reflect-metadata";
import { readFile } from "node:fs/promises";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { CategoryModel } from "../modules/category/infrastructure/category.schema.js";
import { ProductModel } from "../modules/product/infrastructure/product.schema.js";
import { Product } from "../modules/product/entities/product.entity.js";
import { ProductRepository } from "../modules/product/repositories/product.repository.js";
import { PRODUCT_LIMITS, type IIngredient, type ProductType, type VariantUnit } from "../modules/product/types/product.type.js";
import { toUniqueSlug } from "../core/utils/to.slug.helper.js";
import { toTitleCase } from "../core/utils/to.title.case.helper.js";

dotenv.config();

type ProductSeed = {
  name: string;
  categoryName: string;
  type?: ProductType;
  shortDescription: string;
  description: string;
  ingredients?: IIngredient[];
  howToUse?: string;
  storage?: string;
  badge?: string;
  isFeatured?: boolean;
  variants: {
    quantity: number;
    unit: VariantUnit;
    mrp: number;
    price: number;
    stock: number;
    isDefault?: boolean;
  }[];
};

// Usage: npm run seed:products -- <path to products.json>
// Products are added as inactive drafts with no photos. Add photos in the admin panel, then unblock the product to publish it.
const seedProducts = async () => {
  const mongoUri = process.env.MONGO_URI;
  const filePath = process.argv[2];

  if (!mongoUri) {
    console.error("❌ MONGO_URI is not set in .env");
    process.exit(1);
  }

  if (!filePath) {
    console.error("❌ Pass the products file: npm run seed:products -- <path to products.json>");
    process.exit(1);
  }

  const seeds = JSON.parse(await readFile(filePath, "utf8")) as ProductSeed[];

  await mongoose.connect(mongoUri);

  const productRepository = new ProductRepository();
  let createdCount = 0;
  let skippedCount = 0;

  for (const seed of seeds) {
    const name = toTitleCase(seed.name.trim());

    if (await ProductModel.exists({ name })) {
      console.log(`ℹ️ Product already exists: ${name}`);
      skippedCount++;
      continue;
    }

    const category = await CategoryModel.findOne({ name: seed.categoryName });

    if (!category) {
      console.error(`❌ Category not found for ${name}: ${seed.categoryName}`);
      skippedCount++;
      continue;
    }

    try {
      const product = new Product({
        name,
        slug: await toUniqueSlug(name, PRODUCT_LIMITS.slug, (slug) => productRepository.isSlugTaken(slug)),
        category: category._id.toString(),
        type: seed.type,
        shortDescription: seed.shortDescription,
        description: seed.description,
        ingredients: seed.ingredients,
        howToUse: seed.howToUse,
        storage: seed.storage,
        badge: seed.badge,
        images: [],
        isFeatured: seed.isFeatured ?? false,
        variants: seed.variants.map((variant) => ({
          quantity: variant.quantity,
          unit: variant.unit,
          mrp: variant.mrp,
          price: variant.price,
          stock: variant.stock,
        })),
        isActive: false,
      });

      const defaultVariantIndex = Math.max(seed.variants.findIndex((variant) => variant.isDefault), 0);
      await productRepository.create(product, defaultVariantIndex);

      console.log(`✅ Created draft product: ${name}`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Failed to create ${name}:`, error instanceof Error ? error.message : error);
      skippedCount++;
    }
  }

  console.log(`\n✨ Done. Created: ${createdCount}, Skipped: ${skippedCount}`);
  await mongoose.disconnect();
};

seedProducts().catch((error) => {
  console.error("❌ Failed to seed products:", error);
  process.exit(1);
});
