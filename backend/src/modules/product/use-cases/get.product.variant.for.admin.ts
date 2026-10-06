import type { IGetProductVariantForAdmin } from "./interfaces/get.product.variant.for.admin.interface.js";
import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { AdminVariantView } from "../types/product.type.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

@injectable()
export class GetProductVariantForAdmin implements IGetProductVariantForAdmin {

    constructor(
        @inject("IProductRepository")
        private readonly productRepository: IProductRepository,
    ) { }

    async execute(productId: string, variantId: string): Promise<AdminVariantView> {
        const variant = await this.productRepository.findProductVariant(productId, variantId);

        if (!variant) {
            throw new CustomError(ResponseMessages.VARIANT_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        return variant;
    }
}   