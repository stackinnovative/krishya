import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IAddProductVariantUseCase } from "./interfaces/add.product.variant.use-case.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { AddVariantRequestDto } from "../dtos/variant.dto.js";
import { PRODUCT_LIMITS } from "../types/product.type.js";
import { hasDuplicateVariantSizes } from "../utils/variant.helper.js";

@injectable()
export class AddProductVariantUseCase
  implements IAddProductVariantUseCase {
  constructor(
    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository,
  ) { }

  async execute(
    productId: string,
    dto: AddVariantRequestDto[]
  ): Promise<void> {

    const product = await this._productRepository.findById(productId);

    if (!product) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    // 🔒 Business invariants, checked against the variants already saved
    const combined = [...product.variants, ...dto];

    if (combined.length > PRODUCT_LIMITS.variantsMax) {
      throw new CustomError(
        ResponseMessages.PRODUCT_TOO_MANY_VARIANTS,
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (hasDuplicateVariantSizes(combined)) {
      throw new CustomError(
        ResponseMessages.PRODUCT_DUPLICATE_VARIANT_SIZE,
        HttpStatusCode.BAD_REQUEST
      );
    }

    const updated = await this._productRepository.addVariants(productId, dto);

    if (!updated) {
      throw new CustomError(
        ResponseMessages.PRODUCT_UPDATE_FAILED,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
