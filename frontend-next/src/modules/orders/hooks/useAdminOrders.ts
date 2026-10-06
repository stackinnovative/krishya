import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  acceptOrderApi,
  cancelOrderApi,
  deliverOrderApi,
  dispatchOrderApi,
  getAdminOrderDetailsApi,
  getAdminOrderListApi,
} from "../api/order.api";

export const useAdminOrders = (query: Record<string, unknown>) =>
  useQuery({
    queryKey: ["admin-orders", query],
    queryFn: () => getAdminOrderListApi(query),
    placeholderData: (prev) => prev,
    // A new order comes from a customer on a completely separate session, so
    // nothing in this app can invalidate this query for them - poll instead.
    // Only runs while this hook is actually mounted (leaving the Orders page
    // stops it) and pauses whenever the tab isn't focused, so it's not
    // running up API calls for a page nobody's looking at.
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

export const useAdminOrderDetails = (orderId: string | null) =>
  useQuery({
    queryKey: ["admin-order-details", orderId],
    queryFn: () => getAdminOrderDetailsApi(orderId as string),
    enabled: !!orderId,
  });

const useOrderStatusMutation = (fn: (id: string) => Promise<unknown>, successMessage: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (_res, orderId) => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-details", orderId] });
    },
    onError: () => toast.error("Could not update the order. Try again."),
  });
};

export const useAcceptOrder = () => useOrderStatusMutation(acceptOrderApi, "Order accepted");
export const useDispatchOrder = () => useOrderStatusMutation(dispatchOrderApi, "Order dispatched");
export const useDeliverOrder = () => useOrderStatusMutation(deliverOrderApi, "Order marked delivered");
export const useCancelOrder = () => useOrderStatusMutation(cancelOrderApi, "Order cancelled");
