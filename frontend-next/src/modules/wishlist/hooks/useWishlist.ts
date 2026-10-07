"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGuestId } from "@/lib/guest";
import toast from "react-hot-toast";
import { showStoreToast } from "@/modules/storefront-shell/components/StoreToast";
import { getWishlistApi, getWishlistIdsApi, toggleWishlistApi } from "../api/wishlist.api";

export const useWishlist = () => {
  const guestId = getGuestId();
  return useQuery({ queryKey: ["wishlist", guestId], queryFn: () => getWishlistApi(guestId), enabled: !!guestId });
};

export const useWishlistIds = () => {
  const guestId = getGuestId();
  return useQuery({ queryKey: ["wishlist-ids", guestId], queryFn: () => getWishlistIdsApi(guestId), enabled: !!guestId });
};

/** `name` labels the confirmation toast; `silent` skips it (e.g. when "Move to cart" shows its own). */
type ToggleWishlistVars = { productId: string; name?: string; silent?: boolean };

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const guestId = getGuestId();
  return useMutation({
    mutationFn: ({ productId }: ToggleWishlistVars) => toggleWishlistApi(guestId, productId),
    onSuccess: (res, vars) => {
      if (!vars.silent) showStoreToast({ title: res.data?.added ? "Saved to wishlist" : "Removed from wishlist", detail: vars.name });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-ids"] });
    },
    onError: () => toast.error("Could not update your wishlist."),
  });
};
