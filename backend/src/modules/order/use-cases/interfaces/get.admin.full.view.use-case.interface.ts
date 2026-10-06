import type { AdminOrderFullView } from "../../types/order.type.js";

export interface IGetAdminFullViewUseCase {
    execute(orderId: string): Promise<AdminOrderFullView>;
}