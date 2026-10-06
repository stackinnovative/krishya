import type { OrderSummaryView } from "../../types/order.type.js";

export interface IGetOrderSummaryUseCase {
    execute(orderId: string, guestId: string): Promise<OrderSummaryView>;
}