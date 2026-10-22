import type { OrderStatus } from "../types/order.type";

/**
 * The imported design's statuses (Pending/Processing/Shipped/Delivered/
 * Cancelled) are a generic mockup vocabulary; the real backend order
 * lifecycle is created -> confirmed -> accepted -> dispatched -> delivered,
 * or cancelled at any point (see backend/src/modules/order). This maps the
 * real statuses onto display labels and the design's colour system so the
 * admin UI matches the design's visual language exactly while reflecting
 * the actual order lifecycle.
 */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  created: "New",
  confirmed: "Confirmed",
  accepted: "Accepted",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_DONUT_COLOR: Record<OrderStatus, string> = {
  created: "#f8d77a",
  confirmed: "#f7a072",
  accepted: "#7fb3f0",
  dispatched: "#b48ee0",
  delivered: "#b5e36e",
  cancelled: "#e5533f",
};

export const ORDER_STATUS_BADGE: Record<OrderStatus, { bg: string; fg: string }> = {
  created: { bg: "#fdf0dc", fg: "#c27a12" },
  confirmed: { bg: "#fdf0dc", fg: "#c27a12" },
  accepted: { bg: "#e3edfb", fg: "#2f6fd6" },
  dispatched: { bg: "#e3edfb", fg: "#2f6fd6" },
  delivered: { bg: "#e4f7e8", fg: "#2e9e4b" },
  cancelled: { bg: "#fde8e4", fg: "#d6432f" },
};

/**
 * The exact set of admin-actionable next statuses per current status -
 * mirrors the backend's per-endpoint guards 1:1 (one `if` check per
 * use-case in backend/src/modules/order/use-cases/*.order.use-case.ts):
 * accept requires `confirmed`, dispatch requires `accepted`, deliver
 * requires `dispatched`, and cancel is allowed from anything except
 * `delivered`/`cancelled`. `created` has no admin "confirm" action at all -
 * that status is only ever left via the payment webhook confirming the
 * order, not an admin endpoint - so its only admin-actionable move is
 * cancel.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  created: ["cancelled"],
  confirmed: ["accepted", "cancelled"],
  accepted: ["dispatched", "cancelled"],
  dispatched: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

/** Wording for each transition's menu item/button - falls back to `Mark ${label}` when a status has no override. */
export const ORDER_STATUS_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  accepted: "Accept order",
  dispatched: "Mark dispatched",
  delivered: "Mark delivered",
  cancelled: "Cancel order",
};
