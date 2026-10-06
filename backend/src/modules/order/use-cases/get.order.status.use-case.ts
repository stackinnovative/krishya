import { injectable, inject } from "tsyringe";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { OrderStatus } from "../types/order.type.js";
import type { IGetOrderStatusUseCase } from "./interfaces/get.order.status.use-case.interface.js";

@injectable()
export class GetOrderStatusUseCase implements IGetOrderStatusUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly orderRepository: IOrderRepository) { }

    async execute(orderId: string): Promise<OrderStatus> {
        return this.orderRepository.getOrderStatus(orderId);
    }
}