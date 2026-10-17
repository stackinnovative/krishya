import type { ApiResponse } from "@/shared/types/api.types";

export type AddCartItemPayload = { guestId: string; productId: string; variantId: string; quantity: number };

/** `mrp` is the struck-through price - equal to `price` when there's no discount. */
export type ProductView = { image: string; price: number; mrp: number; name: string };
/** `label` is the quantity as bought - "200 ml", "60 tablets". */
export type VariantView = { id: string; label: string };

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

export type CheckoutItemView = { name: string; label: string; quantity: number; price: number; mrp: number; image: string };

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
