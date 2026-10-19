import type { ClientSession } from "mongoose";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import type { IEmailService } from "../../../core/ports/email.service.interface.js";
import type { Order, OrderItem } from "../entities/order.entity.js";

export type PaidOrderOutcome = "confirmed" | "refund_needed";

/**
 * Moves an order whose payment was just captured to "confirmed", inside the
 * caller's transaction. Shared by verify-payment, sync-payment and the
 * Razorpay webhook so all three handle the same edge case:
 *
 * the shopper pays AFTER the auto-cancel job already cancelled the order and
 * gave its stock back. The stock is re-reserved (atomically, per item) and the
 * order revived; if any item has sold out in the meantime, nothing is taken,
 * the order stays cancelled and the caller must flag the payment for a refund.
 */
export async function confirmPaidOrder(
  orderRepository: IOrderRepository,
  productRepository: IProductRepository,
  order: Order,
  session: ClientSession
): Promise<PaidOrderOutcome> {
  if (order.orderStatus !== "cancelled") {
    await orderRepository.confirmOrder(order.id!, session);
    return "confirmed";
  }

  const reserved: OrderItem[] = [];
  for (const item of order.items) {
    const ok = await productRepository.decrementStock({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      session,
    });
    if (!ok) {
      for (const done of reserved) {
        await productRepository.incrementStock({
          productId: done.productId,
          variantId: done.variantId,
          quantity: done.quantity,
          session,
        });
      }
      return "refund_needed";
    }
    reserved.push(item);
  }

  await orderRepository.reconfirmCancelledOrder(order.id!, session);
  return "confirmed";
}

/** The customer was charged for an order that can't be fulfilled - the admin has to refund it from the Razorpay dashboard. */
export function notifyPaidOrderNeedsRefund(emailService: IEmailService, order: Order): void {
  console.error(`Order #${order.orderNumber} was paid after it was cancelled and is out of stock - refund needed`);

  emailService
    .sendAdminOrderCancelled({
      orderNumber: order.orderNumber,
      customerName: order.userSnapshot.name,
      customerEmail: order.userSnapshot.email,
      totalAmount: order.totalAmount,
      reason: "REFUND NEEDED: payment was captured after this order was auto-cancelled, and the items are no longer in stock. Refund it from the Razorpay dashboard.",
    })
    .catch((error) =>
      console.error(`Failed to send admin refund-needed email for #${order.orderNumber}:`, error)
    );
}
