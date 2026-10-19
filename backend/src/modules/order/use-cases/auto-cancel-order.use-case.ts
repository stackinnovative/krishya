import { inject, injectable } from "tsyringe";
import type { IAutoCancelOrderUseCase } from "./interfaces/auto.cancel-order.use-case.js";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import mongoose from "mongoose";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import type { IPaymentRepository } from "../../payment/repositories/payment.repository.interface.js";
import type { IEmailService } from "../../../core/ports/email.service.interface.js";
import type { Order } from "../entities/order.entity.js";

@injectable()
export class AutoCancelOrderUseCase implements IAutoCancelOrderUseCase {
  constructor(
    @inject("IOrderRepository")
    private _orderRepository: IOrderRepository,

    @inject("IProductRepository")
    private _productRepository: IProductRepository,

    @inject("IPaymentRepository")
    private _paymentRepository: IPaymentRepository,

    @inject("IEmailService")
    private _emailService: IEmailService,
  ) { }

  async execute(): Promise<void> {
    // 10 minutes ago
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Find pending orders older than 10 minutes
    const orders = await this._orderRepository.findPendingOlderThan(
      tenMinutesAgo
    );

    // One transaction per order: a single bad order (or one confirmed by a
    // payment at the same moment) is skipped instead of rolling back - and
    // blocking forever - every other expired order in the batch.
    for (const order of orders) {
      try {
        await this._cancelOne(order);
      } catch (error) {
        console.error(`Auto-cancel failed for order #${order.orderNumber}:`, error);
      }
    }
  }

  private async _cancelOne(order: Order): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Cancel first - it only matches a still-"created" order, so if a payment confirmed it a moment ago this
      // throws and the stock below is never given back twice.
      await this._orderRepository.autoCancelOlderThan([order.id!], session);

      for (const item of order.items) {
        await this._productRepository.incrementStock({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          session,
        });
      }

      await this._paymentRepository.autoCancelPayment([order.id!], session);

      await session.commitTransaction();

      const reason = "Payment was not completed within 10 minutes";

      this._emailService
        .sendOrderStatusUpdate({
          to: order.userSnapshot.email,
          orderNumber: order.orderNumber,
          status: "cancelled",
          customerName: order.userSnapshot.name,
          title: "Order Cancelled",
        })
        .catch((error) =>
          console.error(`Failed to send order-cancelled email for #${order.orderNumber}:`, error)
        );

      this._emailService
        .sendAdminOrderCancelled({
          orderNumber: order.orderNumber,
          customerName: order.userSnapshot.name,
          customerEmail: order.userSnapshot.email,
          totalAmount: order.totalAmount,
          reason,
        })
        .catch((error) =>
          console.error(`Failed to send admin order-cancelled email for #${order.orderNumber}:`, error)
        );
    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}