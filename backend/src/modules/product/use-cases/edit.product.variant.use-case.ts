import { inject, injectable } from "tsyringe";
import type { IEditProductVariantUseCase } from "./interfaces/edit.product.variant.use-case.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { UpdateVariantRequestDto } from "../dtos/variant.dto.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

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
    console.log("inside edit product variant use case ", dto)
    const product = await this._productRepository.findById(productId);

    if (!product) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    const variant = product.variants.find(
      (v) => v?.id!.toString() === variantId
    );

    if (!variant) {
      throw new CustomError(
        ResponseMessages.VARIANT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }





    const updated = await this._productRepository.updateVariantById({
      productId,
      variantId,
      data: {
        stock: dto.stock,
        price: dto.price,
        isActive: dto.isActive,
        isDefault: dto.isDefault ?? false,
      },
    });

    if (!updated) {
      throw new CustomError(
        ResponseMessages.PRODUCT_UPDATE_FAILED,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
