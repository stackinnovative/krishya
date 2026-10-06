import type { VerifyPaymentRequestDto } from "../../dtos/verify.payment.dto.js";

export interface IVerifyPaymentUseCase {
    execute(data: VerifyPaymentRequestDto): Promise<void>;
}