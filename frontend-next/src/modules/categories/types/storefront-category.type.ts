import type { ApiResponse } from "@/shared/types/api.types";
import type { CategoryIconName } from "../constants/category-icons";

/** An active category as the storefront gets it - a tile, filter pill or shop link. */
export type StorefrontCategory = { id: string; name: string; slug: string; icon: CategoryIconName };
export type GetStorefrontCategoriesResponse = ApiResponse<StorefrontCategory[]>;

/** Active categories that have at least one active product. */
export type GetSignatureCategoriesResponse = GetStorefrontCategoriesResponse;
