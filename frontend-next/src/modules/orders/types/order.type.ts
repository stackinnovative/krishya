import type { ApiResponse, GetAllDocResponse } from "@/shared/types/api.types";

export type OrderStatus = "created" | "confirmed" | "accepted" | "dispatched" | "delivered" | "cancelled";

export type OrderPlacementPayload = {
  guestId: string;
  cartId: string;
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  acceptedTerms: boolean;
};

export interface IRazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, unknown>;
  created_at: number;
}

export type CreateOrderResponse = ApiResponse<IRazorpayOrder>;

export interface IRazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  notes?: Record<string, string>;
  prefill?: { name?: string; email?: string; contact?: string };
  modal?: { ondismiss?: () => void };
  onPaymentFailed?: (response: unknown) => void;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
}

export interface OrderItemView {
  itemId: string;
  productId: string;
  size: string;
  name: string;
  price: number;
  quantity: number;
}

export interface UserSnapshotView {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderSummaryView {
  id: string;
  orderNumber: string;
  userSnapshot: UserSnapshotView;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt: string;
  items: OrderItemView[];
}

export type OrderSummaryResponse = ApiResponse<OrderSummaryView>;

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt: string;
  itemsCount: number;
};

export type AdminOrderFullView = {
  id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  pricing: { subtotal: number; shippingFee: number; totalAmount: number };
  orderStatus: OrderStatus;
  cancelReason?: string;
  timeline: {
    createdAt: string;
    confirmedAt?: string;
    acceptedAt?: string;
    dispatchedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
  };
  payment?: { paymentId: string; status: string; method?: string; paidAt?: string };
  items: {
    productId: string;
    variantId: string;
    name: string;
    size: string;
    price: number;
    quantity: number;
    mrp?: number;
    image?: string;
  }[];
};

export type AdminOrderFullResponse = ApiResponse<AdminOrderFullView>;
export type AdminOrderListResponse = GetAllDocResponse<AdminOrderListItem[]>;
export type SyncPaymentResponse = ApiResponse<{ status: string }>;
