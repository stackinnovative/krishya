import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { syncPaymentApi } from "../api/order.api";
import { invalidateCartViews } from "@/modules/cart/hooks/useCart";

/**
 * Run once on the order success page. Asks the backend to confirm the
 * payment with Razorpay right away (it empties the cart on confirm) instead
 * of waiting for the webhook, then refetches every cart view - the navbar /
 * tab-bar count stays mounted across pages, so without this it kept showing
 * the paid-for items. Idempotent on the backend; a query (not a bare effect)
 * so Strict Mode's double mount doesn't fire it twice.
 */
export const usePaymentSync = (orderId: string) => {
  const queryClient = useQueryClient();
  const { isFetched } = useQuery({
    queryKey: ["payment-sync", orderId],
    queryFn: () => syncPaymentApi(orderId),
    enabled: !!orderId,
    staleTime: Infinity,
    retry: false,
  });

  // Also on failure - the webhook or verify-payment may already have emptied the cart.
  useEffect(() => {
    if (isFetched) invalidateCartViews(queryClient);
  }, [isFetched, queryClient]);
};
