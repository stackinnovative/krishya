import { container } from "tsyringe";
import type { IPaymentRepository } from "../modules/payment/repositories/payment.repository.interface.js";
import { PaymentRepository } from "../modules/payment/repositories/payment.repository.js";

export const registerPaymentDependencies = () => {
    container.register<IPaymentRepository>("IPaymentRepository", {
        useClass: PaymentRepository,
    });


};