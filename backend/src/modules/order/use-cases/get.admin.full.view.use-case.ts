import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { AdminOrderFullView } from "../types/order.type.js";
import type { IGetAdminFullViewUseCase } from "./interfaces/get.admin.full.view.use-case.interface.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

@injectable()
export class GetAdminFullViewUseCase implements IGetAdminFullViewUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly orderRepository: IOrderRepository) { }

    async execute(orderId: string): Promise<AdminOrderFullView> {
        const order = await this.orderRepository.getAdminOrderFullView(orderId);
        if (!order) {
            throw new CustomError(
                ResponseMessages.ORDER_NOT_FOUND,
                HttpStatusCode.NOT_FOUND,
            );
        }
        return order;
    }
}