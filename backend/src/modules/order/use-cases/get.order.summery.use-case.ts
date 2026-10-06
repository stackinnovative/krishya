import type { IGetOrderSummaryUseCase } from "./interfaces/get.order.summery.use-case.interface.js";
import type { OrderSummaryView } from "../types/order.type.js";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

@injectable()
export class GetOrderSummaryUseCase implements IGetOrderSummaryUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly orderRepository: IOrderRepository
    ) { }

    async execute(orderId: string, guestId: string): Promise<OrderSummaryView> {
        const order = await this.orderRepository.getSummary(orderId, guestId);
        if (!order) {
            throw new CustomError(
                ResponseMessages.ORDER_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            )
        }
        return order;
    }
}