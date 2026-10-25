import dotenv from "dotenv";
import mongoose from "mongoose";
import { CategoryModel } from "../modules/category/infrastructure/category.schema.js";
import { toSlug } from "../core/utils/to.slug.helper.js";
import { CATEGORY_LIMITS, type CategoryIconName } from "../modules/category/types/category.type.js";

dotenv.config();

type CategorySeed = {
  name: string;
  description: string;
  icon: CategoryIconName;
};

// The "Shop by Health Need" list from the design, in display order.
const CATEGORY_SEED_DATA: CategorySeed[] = [
  { name: "Joint & Muscle Care", description: "Oils and preparations for joint comfort and easy movement.", icon: "Bone" },
  { name: "Hair Care", description: "Keram oils for scalp and hair oiling rituals.", icon: "Sprout" },
  { name: "Skin Care", description: "Classical oils and packs for daily skincare rituals.", icon: "Sparkles" },
  { name: "Immunity", description: "Everyday preparations that support natural resilience.", icon: "ShieldPlus" },
  { name: "Women's Wellness", description: "Traditional formulations for women's health.", icon: "Flower2" },
];

const seedCategories = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MONGO_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  let createdCount = 0;
  let skippedCount = 0;

  for (const [index, seed] of CATEGORY_SEED_DATA.entries()) {
    const existing = await CategoryModel.findOne({ name: seed.name });

    if (existing) {
      console.log(`ℹ️ Category already exists: ${seed.name}`);
      skippedCount++;
      continue;
    }

    await CategoryModel.create({
      name: seed.name,
      slug: toSlug(seed.name, CATEGORY_LIMITS.slug),
      description: seed.description,
      icon: seed.icon,
      sortOrder: index,
    });
    console.log(`✅ Created category: ${seed.name}`);
    createdCount++;
  }

  console.log(`\n✨ Done. Created: ${createdCount}, Skipped: ${skippedCount}`);
  await mongoose.disconnect();
};

seedCategories().catch((error) => {
  console.error("❌ Failed to seed categories:", error);
  process.exit(1);
});
