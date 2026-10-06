import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IAddColorOptionUseCase } from "./interfaces/add.color.option.use-case.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { AddColorOptionRequestDto } from "../dtos/color.option.dto.js";

@injectable()
export class AddColorOptionUseCase implements IAddColorOptionUseCase {
  constructor(
    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository,
  ) {}

  async execute(productId: string, dto: AddColorOptionRequestDto): Promise<void> {
    const product = await this._productRepository.findById(productId);

    if (!product) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (dto.colorName) {
      const key = dto.colorName.trim().toLowerCase();
      const isDuplicate = product.colorOptions.some(
        (c) => c.colorName?.trim().toLowerCase() === key,
      );

      if (isDuplicate) {
        throw new CustomError(
          ResponseMessages.COLOR_NAME_DUPLICATE,
          HttpStatusCode.BAD_REQUEST,
        );
      }
    }

    const updated = await this._productRepository.addColorOption(productId, {
      colorName: dto.colorName,
      hex: dto.hex,
      images: dto.images,
      variants: dto.variants.map((v) => ({
        size: v.size,
        stock: v.stock,
        price: v.price,
        isActive: true,
        isDefault: v.isDefault ?? false,
      })),
    });

    if (!updated) {
      throw new CustomError(
        ResponseMessages.PRODUCT_UPDATE_FAILED,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
