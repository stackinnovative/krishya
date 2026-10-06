import type { IDownloadInvoiceUseCase } from "./interfaces/download.invoice.use-case.interface.ts";
import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { IInvoiceService } from "../../../core/ports/invoice.service.interface.ts";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";


@injectable()
export class DownloadInvoiceUseCase implements IDownloadInvoiceUseCase {
    constructor(
        @inject("IOrderRepository") private readonly orderRepository: IOrderRepository,
        @inject("IInvoiceService") private readonly invoiceService: IInvoiceService,
    ) { }
    async execute(orderId: string, guestId: string): Promise<Buffer> {
        const order = await this.orderRepository.getSummary(orderId, guestId);
        if (!order) {
            throw new CustomError(
                ResponseMessages.ORDER_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            )
        }
        const pdfBuffer = await this.invoiceService.generateInvoice(order);

        return pdfBuffer;
    }
}