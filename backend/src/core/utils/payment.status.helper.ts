import type { PaymentStatus } from "../../modules/payment/types/payment.type.js";

export function mapRazorpayStatus(
  status: string
): PaymentStatus {

  switch (status) {
    case "created":
      return "created";

    case "authorized":
      return "authorized";

    case "captured":
      return "captured";

    case "failed":
      return "failed";

    case "refunded":
      return "refunded";

    default:
      throw new Error(`Unknown Razorpay status: ${status}`);
  }
}