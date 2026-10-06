"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGuestId } from "@/lib/guest";
import { getWishlistApi, getWishlistIdsApi, toggleWishlistApi } from "../api/wishlist.api";

export const useWishlist = () => {
  const guestId = getGuestId();
  return useQuery({ queryKey: ["wishlist", guestId], queryFn: () => getWishlistApi(guestId), enabled: !!guestId });
};

export const useWishlistIds = () => {
  const guestId = getGuestId();
  return useQuery({ queryKey: ["wishlist-ids", guestId], queryFn: () => getWishlistIdsApi(guestId), enabled: !!guestId });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const guestId = getGuestId();
  return useMutation({
    mutationFn: (productId: string) => toggleWishlistApi(guestId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-ids"] });
    },
  });
};
