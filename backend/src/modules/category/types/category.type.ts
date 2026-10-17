/**
 * Curated Lucide icon names an admin can pick for a category (a health need
 * like "Hair Care"). A fixed allow-list, like POLICY_ICON_NAMES, so the
 * storefront can always resolve a category's icon to a real component.
 */
export const CATEGORY_ICON_NAMES = [
  "Leaf",
  "Sprout",
  "Flower2",
  "Droplets",
  "Sparkles",
  "Sun",
  "Moon",
  "Flame",
  "Wind",
  "HeartPulse",
  "HandHeart",
  "ShieldPlus",
  "Bone",
  "Activity",
  "Brain",
  "Soup",
  "Wheat",
  "Pill",
  "Baby",
  "Smile",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICON_NAMES)[number];

export const CATEGORY_LIMITS = {
  slug: 120,
  sortOrderMax: 999,
} as const;

export interface CategoryProps {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  icon: CategoryIconName;
  sortOrder?: number;
  isActive?: boolean;
}

/** What the storefront needs to show a category as a tile, filter or page link. */
export type CategoryUserView = {
  id: string;
  name: string;
  slug: string;
  icon: CategoryIconName;
};
