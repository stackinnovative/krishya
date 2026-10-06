import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { IInvoiceService } from "../../../core/ports/invoice.service.interface.ts";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import type { IAdminDownloadInvoiceUseCase } from "./interfaces/admin.dowload.invoice.use-case.interface.js";


@injectable()
export class AdminDownloadInvoiceUseCase implements IAdminDownloadInvoiceUseCase {
    constructor(
        @inject("IOrderRepository") private readonly orderRepository: IOrderRepository,
        @inject("IInvoiceService") private readonly invoiceService: IInvoiceService,
    ) { }
    async execute(orderId: string): Promise<Buffer> {
        const order = await this.orderRepository.getAdminSummery(orderId);
        if (!order) {
            throw new CustomError(
                ResponseMessages.ORDER_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            )
        }
        console.log("Order found, generating invoice...", order);
        const pdfBuffer = await this.invoiceService.generateInvoice(order);

        return pdfBuffer;
    }
}