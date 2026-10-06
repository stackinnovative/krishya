import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import { Product } from "../entities/product.entity.js";
import type { ICreateProductUseCase } from "./interfaces/create.product.use-case.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { CreateProductRequestDto } from "../dtos/create.product.dto.js";
import type { ICategoryRepository } from "../../category/repositories/category.repository.interface.js";

@injectable()
export class CreateProductUseCase implements ICreateProductUseCase {
  constructor(
    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository,

    @inject("ICategoryRepository")
    private readonly _categoryRepository: ICategoryRepository,
  ) { }

  async execute(dto: CreateProductRequestDto): Promise<void> {
    const category = await this._categoryRepository.findById(dto.categoryId);
    if (!category || category.isActive === false) {
      throw new CustomError(
        ResponseMessages.CATEGORY_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    /* ---------- create product entity ---------- */
    const productEntity = new Product({
      id: null,
      name: dto.name,
      description: dto.description,
      category: dto.categoryId,
      colorOptions: dto.colorOptions,
      isActive: true,
      isFeatured: dto.isFeatured,
    });

    const flatVariants = dto.colorOptions.flatMap((c) => c.variants);
    const defaultVariantIndex = Math.max(
      flatVariants.length <= 1 ? 0 : flatVariants.findIndex((v) => v.isDefault),
      0,
    );

    const product = await this._productRepository.create(productEntity, defaultVariantIndex);

    if (!product) {
      throw new CustomError(
        ResponseMessages.PRODUCT_CREATION_FAILED,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
