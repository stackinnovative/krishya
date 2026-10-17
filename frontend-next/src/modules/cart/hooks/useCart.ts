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
import { getProductByIdForUserApi } from "@/modules/products/api/storefront-product.api";
import { showStoreToast } from "@/modules/storefront-shell/components/StoreToast";
import { formatVariantLabel } from "@/modules/products/constants/product-options";
import { cartKeys, productKeys } from "@/shared/query-keys";

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

/** `name`/`size` are display-only - they label the "Added to cart" toast. */
type AddToCartVars = { productId: string; variantId: string; quantity: number; name?: string; size?: string; silent?: boolean };

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const guestId = getGuestId();
  return useMutation({
    mutationFn: ({ productId, variantId, quantity }: AddToCartVars) => addItemToCartApi({ guestId, productId, variantId, quantity }),
    onSuccess: (_res, vars) => {
      if (!vars.silent) {
        const detail = [vars.name, vars.size].filter(Boolean).join(" · ") + (vars.quantity > 1 ? ` × ${vars.quantity}` : "");
        showStoreToast({ title: "Added to cart", detail, showCartLink: true });
      }
      invalidateCartViews(queryClient);
    },
    onError: () => toast.error("Could not add to cart."),
  });
};

/**
 * Add-to-cart from a product card, where only the list item (id/name/price/
 * image) is known: loads the product (reusing the detail page's cache key)
 * and adds its default in-stock variant.
 */
export const useQuickAddToCart = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, variables } = useAddToCart();

  const quickAdd = async (productId: string, name: string, options?: { silent?: boolean }) => {
    try {
      const res = await queryClient.fetchQuery({
        queryKey: [...productKeys.userDetails, productId],
        queryFn: () => getProductByIdForUserApi(productId),
      });
      const variants = res.data?.variants ?? [];
      const variant = variants.find((v) => v.variantId === res.data?.defaultVariantId && v.stock > 0) ?? variants.find((v) => v.stock > 0);
      if (!variant) {
        toast.error(`${name} is out of stock.`);
        return false;
      }
      await mutateAsync({ productId, variantId: variant.variantId, quantity: 1, name, size: formatVariantLabel(variant), silent: options?.silent });
      return true;
    } catch {
      return false;
    }
  };

  return { quickAdd, isPending, pendingProductId: isPending ? variables?.productId : undefined };
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
    mutationFn: ({ cartId, itemId }: { cartId: string; itemId: string; name?: string }) => removeCartItemApi({ guestId, cartId, itemId }),
    onSuccess: (_res, vars) => {
      showStoreToast({ title: "Removed from cart", detail: vars.name });
      invalidateCartViews(queryClient);
    },
  });
};
