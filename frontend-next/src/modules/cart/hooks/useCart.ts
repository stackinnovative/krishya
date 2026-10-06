"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getGuestId } from "@/lib/guest";
import {
  addItemToCartApi,
  getCartApi,
  getCartItemsCountApi,
  getCheckoutApi,
  removeCartItemApi,
  updateCartCountApi,
} from "../api/cart.api";
import type { ActionType } from "../types/cart.type";
import { cartKeys } from "@/shared/query-keys";

export const useCart = () => {
  const guestId = getGuestId();
  return useQuery({ queryKey: [...cartKeys.cart, guestId], queryFn: () => getCartApi(guestId), enabled: !!guestId });
};

export const useCartCount = () => {
  const guestId = getGuestId();
  return useQuery({ queryKey: [...cartKeys.count, guestId], queryFn: () => getCartItemsCountApi(guestId), enabled: !!guestId });
};

export const useCheckoutItems = () => {
  const guestId = getGuestId();
  return useQuery({ queryKey: [...cartKeys.checkoutItems, guestId], queryFn: () => getCheckoutApi(guestId), enabled: !!guestId });
};

const invalidateCartViews = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: cartKeys.cart });
  queryClient.invalidateQueries({ queryKey: cartKeys.count });
  queryClient.invalidateQueries({ queryKey: cartKeys.checkoutItems });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const guestId = getGuestId();
  return useMutation({
    mutationFn: ({ productId, variantId, quantity }: { productId: string; variantId: string; quantity: number }) =>
      addItemToCartApi({ guestId, productId, variantId, quantity }),
    onSuccess: () => {
      toast.success("Added to cart");
      invalidateCartViews(queryClient);
    },
    onError: () => toast.error("Could not add to cart."),
  });
};

export const useUpdateCartCount = () => {
  const queryClient = useQueryClient();
  const guestId = getGuestId();
  return useMutation({
    mutationFn: ({ cartId, itemId, action }: { cartId: string; itemId: string; action: ActionType }) =>
      updateCartCountApi({ guestId, cartId, itemId, action }),
    onSuccess: () => invalidateCartViews(queryClient),
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const guestId = getGuestId();
  return useMutation({
    mutationFn: ({ cartId, itemId }: { cartId: string; itemId: string }) => removeCartItemApi({ guestId, cartId, itemId }),
    onSuccess: () => {
      toast.success("Removed from cart");
      invalidateCartViews(queryClient);
    },
  });
};
