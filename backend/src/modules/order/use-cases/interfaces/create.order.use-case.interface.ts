import type { CreateOrderRequestDto } from "../../dtos/create.order.dto.js";
import type { IRazorpayOrder } from "../../types/order.type.js";

export interface ICreateOrderUseCase {
    execute(data: CreateOrderRequestDto): Promise<IRazorpayOrder>;
}