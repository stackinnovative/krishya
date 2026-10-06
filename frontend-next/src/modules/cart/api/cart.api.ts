import api from "@/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";
import type {
  AddCartItemPayload,
  CheckoutResponse,
  GetCartItemsCountResponse,
  GetCartResponse,
  RemoveCartItemPayload,
  UpdateCartCountPayload,
} from "../types/cart.type";

export const addItemToCartApi = (data: AddCartItemPayload) => api.post<ApiResponse>("/cart", data).then((r) => r.data);
export const getCartApi = (guestId: string) => api.get<GetCartResponse>(`/cart/${guestId}`).then((r) => r.data);
export const updateCartCountApi = (data: UpdateCartCountPayload) =>
  api.patch<ApiResponse>("/cart/update-cart-count", data).then((r) => r.data);
export const removeCartItemApi = (data: RemoveCartItemPayload) =>
  api.patch<ApiResponse>("/cart/remove-cart-item", data).then((r) => r.data);
export const getCheckoutApi = (guestId: string) => api.get<CheckoutResponse>(`/cart/checkout-item/${guestId}`).then((r) => r.data);
export const getCartItemsCountApi = (guestId: string) =>
  api.get<GetCartItemsCountResponse>(`/cart/cart-items-count/${guestId}`).then((r) => r.data);
