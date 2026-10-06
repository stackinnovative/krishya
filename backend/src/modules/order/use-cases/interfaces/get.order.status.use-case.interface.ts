import type { OrderStatus } from "../../types/order.type.js";

export interface IGetOrderStatusUseCase {
    execute(orderId: string): Promise<OrderStatus>;
}