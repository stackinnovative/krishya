import type { ApiResponse } from "@/shared/types/api.types";

export type AddCartItemPayload = { guestId: string; productId: string; variantId: string; quantity: number };

export type ProductView = { image: string; price: number; name: string };
export type VariantView = { id: string; size: string };

export type CartItemView = { itemId: string; product: ProductView; variant: VariantView; quantity: number };

export type CartView = {
  id: string;
  guestId: string;
  items: CartItemView[];
  totalItems: number;
  totalPrice: number;
  deliveryCharge: number;
  total: number;
};

export type ActionType = "increment" | "decrement";

export type UpdateCartCountPayload = { guestId: string; cartId: string; itemId: string; action: ActionType };
export type RemoveCartItemPayload = { guestId: string; cartId: string; itemId: string };

export type GetCartResponse = ApiResponse<CartView>;

export type CheckoutItemView = { name: string; size: string; quantity: number; price: number; image: string };

export type CheckoutView = {
  cartId: string;
  totalItems: number;
  items: CheckoutItemView[];
  subTotal: number;
  deliveryCharge: number;
  total: number;
};

export type CheckoutResponse = ApiResponse<CheckoutView>;
export type GetCartItemsCountResponse = ApiResponse<number>;
