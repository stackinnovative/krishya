import type { HandlePaymentFailureRequestDto } from "../../dtos/failure.order.dto.js";


export interface IHandlePaymentFailureUseCase {
    execute(dto: HandlePaymentFailureRequestDto): Promise<void>;
}