import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { ICancelOrderUseCase } from "./interfaces/cancel.order.use-case.interface.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { IEmailService } from "../../../core/ports/email.service.interface.js";

@injectable()
export class CancelOrderUseCase implements ICancelOrderUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository,

        @inject("IEmailService")
        private readonly _emailService: IEmailService,
    ) { }

    async execute(orderId: string): Promise<void> {
        const order = await this._orderRepository.findById(orderId);
        if (!order) {
            throw new CustomError(
                ResponseMessages.ORDER_NOT_FOUND,
                HttpStatusCode.NOT_FOUND,
            )
        }

        if (order.orderStatus === "delivered") {
            throw new CustomError(
                ResponseMessages.ORDER_DELIVERED,
                HttpStatusCode.BAD_REQUEST,
            )
        }
        if (order.orderStatus === "cancelled") {
            throw new CustomError(
                ResponseMessages.ORDER_CANCELLED,
                HttpStatusCode.BAD_REQUEST,
            )
        }
        await this._orderRepository.cancelOrder(orderId);

        const reason = "Cancelled by admin";

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
    }
}