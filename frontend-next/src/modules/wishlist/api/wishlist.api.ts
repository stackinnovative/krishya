import api from "@/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";
import type { UserProductListItem } from "@/modules/products/types/storefront-product.type";

export type GetWishlistResponse = ApiResponse<UserProductListItem[]>;
export type GetWishlistIdsResponse = ApiResponse<string[]>;
export type ToggleWishlistResponse = ApiResponse<{ added: boolean }>;

export const toggleWishlistApi = (guestId: string, productId: string): Promise<ToggleWishlistResponse> =>
  api.post<ToggleWishlistResponse>("/wishlist/toggle", { guestId, productId }).then((r) => r.data);

export const getWishlistIdsApi = (guestId: string): Promise<GetWishlistIdsResponse> =>
  api.get<GetWishlistIdsResponse>(`/wishlist/ids/${guestId}`).then((r) => r.data);

export const getWishlistApi = (guestId: string): Promise<GetWishlistResponse> =>
  api.get<GetWishlistResponse>(`/wishlist/${guestId}`).then((r) => r.data);
