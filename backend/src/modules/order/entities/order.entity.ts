import type { OrderStatus } from "../types/order.type.js";

/* ---------- TYPES ---------- */

export type OrderItem = {
  id?: string;
  productId: string;
  variantId: string;
  /** The variant label at checkout - "200 ml", "60 tablets". */
  size?: string | undefined;
  name: string;
  price: number;
  /** Snapshotted at checkout, same reasoning as name/price - so later price, quantity or photo edits never change what a past order shows. */
  mrp?: number | undefined;
  quantity: number;
  image?: string | undefined;
};

export type UserSnapshot = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | undefined;
  city: string;
  state: string;
  pincode: string;
};

export type OrderProps = {
  id?: string | null;
  orderNumber: string;
  userId: string | null;
  guestId: string | null;
  userSnapshot: UserSnapshot;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  orderStatus?: OrderStatus;
  cancelReason?: string | undefined;
  items: OrderItem[];
  createdAt?: Date | undefined;
  confirmedAt?: Date | undefined;
  acceptedAt?: Date | undefined;
  dispatchedAt?: Date | undefined;
  deliveredAt?: Date | undefined;
  cancelledAt?: Date | undefined;
};

/* ---------- ENTITY ---------- */

export class Order {
  public readonly id: string | null;
  public readonly orderNumber: string;
  public readonly userId: string | null;
  public readonly guestId: string | null;
  public readonly userSnapshot: UserSnapshot;
  public readonly subtotal: number;
  public readonly shippingFee: number;
  public readonly totalAmount: number;
  public readonly orderStatus: OrderStatus;
  public readonly cancelReason?: string | undefined;
  public readonly items: OrderItem[];
  public readonly createdAt?: Date | undefined;
  public readonly confirmedAt?: Date | undefined;
  public readonly acceptedAt?: Date | undefined;
  public readonly dispatchedAt?: Date | undefined;
  public readonly deliveredAt?: Date | undefined;
  public readonly cancelledAt?: Date | undefined;

  constructor(props: OrderProps) {
    if (!props.orderNumber?.trim()) {
      throw new Error("Order number is required");
    }

    if (!props.userId && !props.guestId) {
      throw new Error("User ID or Guest ID is required");
    }

    if (!props.items || props.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    if (props.subtotal < 0) {
      throw new Error("Subtotal cannot be negative");
    }

    if (props.shippingFee < 0) {
      throw new Error("Shipping fee cannot be negative");
    }

    if (props.totalAmount < 0) {
      throw new Error("Total amount cannot be negative");
    }

    if (
      props.totalAmount !== props.subtotal + props.shippingFee
    ) {
      throw new Error("Invalid order total amount");
    }

    /* ---------- validate user snapshot ---------- */
    if (!props.userSnapshot.name.trim()) {
      throw new Error("User name is required");
    }

    if (!props.userSnapshot.phone.trim()) {
      throw new Error("Phone is required");
    }

    if (!props.userSnapshot.addressLine1.trim()) {
      throw new Error("Address line 1 is required");
    }

    /* ---------- validate items ---------- */
    for (const item of props.items) {
      if (!item.productId) {
        throw new Error("Item product ID required");
      }

      if (!item.name.trim()) {
        throw new Error("Item name required");
      }

      if (item.price < 0) {
        throw new Error("Item price cannot be negative");
      }

      if (item.quantity < 1) {
        throw new Error("Item quantity must be at least 1");
      }
    }

    this.id = props.id ?? null;

    this.orderNumber = props.orderNumber.trim();

    this.userId = props.userId;
    this.guestId = props.guestId;
    this.userSnapshot = props.userSnapshot;

    this.subtotal = props.subtotal;
    this.shippingFee = props.shippingFee;
    this.totalAmount = props.totalAmount;

    this.orderStatus = props.orderStatus ?? "created";
    this.cancelReason = props.cancelReason ?? undefined;
    this.items = props.items;
    this.createdAt = props.createdAt;
    this.confirmedAt = props.confirmedAt;
    this.acceptedAt = props.acceptedAt;
    this.dispatchedAt = props.dispatchedAt;
    this.cancelledAt = props.cancelledAt;
    this.deliveredAt = props.deliveredAt;
  }

  /* ---------- DOMAIN METHODS ---------- */

  confirm(): Order {
    if (this.orderStatus !== "created") {
      throw new Error("Only created orders can be confirmed");
    }

    return new Order({
      ...this,
      orderStatus: "confirmed",
      confirmedAt: new Date(),
    });
  }

  accept(): Order {
    if (this.orderStatus !== "confirmed") {
      throw new Error("Only confirmed orders can be accepted");
    }

    return new Order({
      ...this,
      orderStatus: "accepted",
      acceptedAt: new Date(),
    });
  }

  dispatch(): Order {
    if (this.orderStatus !== "accepted") {
      throw new Error("Only accepted orders can be dispatched");
    }

    return new Order({
      ...this,
      orderStatus: "dispatched",
      dispatchedAt: new Date(),
    });
  }

  cancel(): Order {
    if (this.orderStatus === "dispatched") {
      throw new Error("Dispatched order cannot be cancelled");
    }

    if (this.orderStatus === "cancelled") {
      throw new Error("Order already cancelled");
    }

    return new Order({
      ...this,
      orderStatus: "cancelled",
      cancelledAt: new Date(),
    });
  }
}
