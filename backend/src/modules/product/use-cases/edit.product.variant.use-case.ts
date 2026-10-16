import { inject, injectable } from "tsyringe";
import type { IEditProductVariantUseCase } from "./interfaces/edit.product.variant.use-case.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { UpdateVariantRequestDto } from "../dtos/variant.dto.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { hasDuplicateVariantSizes } from "../utils/variant.helper.js";

@injectable()
export class EditProductVariantUseCase
  implements IEditProductVariantUseCase {
  constructor(
    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository
  ) { }

  async execute(
    productId: string,
    variantId: string,
    dto: UpdateVariantRequestDto
  ): Promise<void> {
    const product = await this._productRepository.findById(productId);

    if (!product) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    if (!product.variants.some((v) => v.id === variantId)) {
      throw new CustomError(
        ResponseMessages.VARIANT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    // The edited quantity must not collide with any *other* variant.
    const others = product.variants.filter((v) => v.id !== variantId);
    if (hasDuplicateVariantSizes([...others, dto])) {
      throw new CustomError(
        ResponseMessages.PRODUCT_DUPLICATE_VARIANT_SIZE,
        HttpStatusCode.BAD_REQUEST
      );
    }

    const updated = await this._productRepository.updateVariantById({
      productId,
      variantId,
      data: dto,
    });

    if (!updated) {
      throw new CustomError(
        ResponseMessages.PRODUCT_UPDATE_FAILED,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
