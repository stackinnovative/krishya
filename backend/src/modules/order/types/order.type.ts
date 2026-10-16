import type { Types } from "mongoose";
import type { ClientSession } from "mongoose";

export const ORDER_STATUS = [
  "created",
  "confirmed",
  "accepted",
  "dispatched",
  "cancelled",
  "delivered"
] as const;

export type OrderStatus =
  (typeof ORDER_STATUS)[number];


export type OrderItemView = {
  itemId: string;
  productId: string;
  name: string;
  price: number;
  size?: string | undefined;
  quantity: number;
};

export type OrderListView = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt: Date;
};

export type OrderView = {
  id: string;
  orderNumber: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt: Date;
  items: OrderItemView[];
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
  notes: Record<string, any>;
  created_at: number;
}

export interface IRazorpayOrderOptions {
  amount: number;
  currency: string;
  receipt: string;
}

export interface IRazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id?: string | undefined;
  invoice_id?: string | undefined;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description?: string | undefined;
  card_id?: string | undefined;
  bank?: string | undefined;
  wallet?: string | undefined;
  vpa?: string | undefined;
  email: string;
  contact: string;
  notes?: Record<string, any> | undefined;
  fee?: number | undefined;
  tax?: number | undefined;
  error_code?: string | undefined;
  error_description?: string | undefined;
  created_at: number;
}

export interface IRazorpayPaymentCollection {
  entity: string;
  count: number;
  items: IRazorpayPayment[];
}



export type AutoCancelPayload = {
  date: Date;
  orderIds: string[];
  reason: string;
  session?: ClientSession;
}



export interface RazorpayWebhookEvent {
  id: string;
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        status: string;
        amount: number;
        currency: string;
        method?: string;
      };
    };
  };
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

  pricing: {
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
  };

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

  payment?: {
    paymentId: string;
    status: string;
    method?: string;
    paidAt?: string;
  };

  items: {
    productId: string;
    variantId: string;
    name: string;
    size?: string | undefined;
    price: number;
    mrp?: number | undefined;
    quantity: number;
    image?: string | undefined;
  }[];
};



export interface IOrderLean {
  _id: Types.ObjectId;
  orderNumber: string;

  userSnapshot: {
    name: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  cancelReason?: string;
  createdAt: Date;
  confirmedAt?: Date;
  acceptedAt?: Date;
  deliveredAt?: Date;
  dispatchedAt?: Date;
  cancelledAt?: Date;
  items: {
    productId: Types.ObjectId;
    variantId: Types.ObjectId;
    name: string;
    size?: string | undefined;
    price: number;
    mrp?: number | undefined;
    quantity: number;
    image?: string | undefined;
  }[];
}

export interface IPaymentLean {
  _id: Types.ObjectId;
  status: string;
  paymentMode?: string;
  createdAt: Date;
}


