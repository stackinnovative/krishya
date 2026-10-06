import dotenv from "dotenv";
import mongoose from "mongoose";
import { CategoryModel } from "../modules/category/infrastructure/category.schema.js";

dotenv.config();

type CategorySeed = {
  name: string;
  description: string;
};

const CATEGORY_SEED_DATA: CategorySeed[] = [
  {
    name: "Photo Frame",
    description: "Classic frames for your favourite photos.",
  },
  {
    name: "Name Frame",
    description: "Custom frames with names or initials.",
  },
  {
    name: "Quote Frame",
    description: "Frames featuring inspiring quotes.",
  },
  {
    name: "Wall Frame",
    description: "Decorative frames for wall display.",
  },
  {
    name: "Wood Frame",
    description: "Premium natural wooden frames.",
  },
  {
    name: "Gift Box",
    description: "Beautifully packed gift boxes.",
  },
  {
    name: "Gift Hamper",
    description: "Curated hampers for celebrations.",
  },
  {
    name: "Photo Gift",
    description: "Personalised gifts with photos.",
  },
  {
    name: "Home Decor",
    description: "Decor pieces for every home.",
  },
  {
    name: "Keepsake Gift",
    description: "Meaningful gifts to treasure.",
  },
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

  for (const seed of CATEGORY_SEED_DATA) {
    const existing = await CategoryModel.findOne({ name: seed.name });

    if (existing) {
      console.log(`ℹ️ Category already exists: ${seed.name}`);
      skippedCount++;
      continue;
    }

    await CategoryModel.create({
      name: seed.name,
      description: seed.description,
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
