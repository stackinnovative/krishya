import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IAddProductVariantUseCase } from "./interfaces/add.product.variant.use-case.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js"; import type { AddVariantRequestDto } from "../dtos/variant.dto.js";
import { assertUniqueVariantSizes } from "../utils/variant.validate.helper.js";

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

    const targetColorOptionId = dto.find((v) => v.colorOptionId)?.colorOptionId
      ?? product.colorOptions[0]?.id;

    const targetColor = product.colorOptions.find(
      (c) => c.id === targetColorOptionId,
    );

    if (!targetColor) {
      throw new CustomError(
        ResponseMessages.COLOR_OPTION_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    const combinedVariants = [
      ...dto,
      ...targetColor.variants.map((v) => ({
        size: v.size,
        stock: v.stock,
        price: v.price,
      })),
    ];

    // 🔒 Business invariant
    const isValid = assertUniqueVariantSizes(combinedVariants);

    if (!isValid) {
      throw new CustomError(
        ResponseMessages.PRODUCT_DUPLICATE_VARIANT_SIZE,
        HttpStatusCode.BAD_REQUEST
      );
    }

    const updated = await this._productRepository.addVariants(
      productId,
      targetColorOptionId!,
      dto.map((v) => ({
        size: v.size,
        stock: v.stock,
        price: v.price,
        isActive: true,
        isDefault: v.isDefault ?? false,
      }))
    );

    if (!updated) {
      throw new CustomError(
        ResponseMessages.PRODUCT_UPDATE_FAILED,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
