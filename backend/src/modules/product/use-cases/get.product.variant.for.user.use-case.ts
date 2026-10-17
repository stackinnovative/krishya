import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { IGetProductVariantForUserUseCase } from "./interfaces/get.product.variant.for.user.use-case.interface.js";
import type { UserVariantView } from "../types/product.type.js";
import { injectable, inject } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

@injectable()
export class GetProductVariantForUserUseCase implements IGetProductVariantForUserUseCase {
    constructor(
        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository,
    ) { }

    async execute(productId: string, variantId: string): Promise<UserVariantView> {
        const productVariant = await this._productRepository.findProductVariant(productId, variantId);
        if (!productVariant) {
            throw new CustomError(
                ResponseMessages.VARIANT_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            )
        }

        return {
            variantId: productVariant.variantId,
            quantity: productVariant.quantity,
            unit: productVariant.unit,
            mrp: productVariant.mrp,
            price: productVariant.price,
            discountPercent: productVariant.discountPercent,
            stock: productVariant.stock,
        }
    }
}   