import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import type { IEditProductUseCase } from "./interfaces/edit.product.use-case.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { EditProductRequestDto } from "../dtos/edit.product.dto.js";
import type { ICategoryRepository } from "../../category/repositories/category.repository.interface.js";

@injectable()
export class EditProductUseCase implements IEditProductUseCase {
  constructor(
    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository,

    @inject("ICategoryRepository")
    private readonly _categoryRepository: ICategoryRepository,
  ) { }

  async execute(
    productId: string,
    dto: EditProductRequestDto
  ): Promise<void> {
    const product =
      await this._productRepository.findById(productId);

    if (!product) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    const category = await this._categoryRepository.findById(dto.categoryId);
    if (!category || category.isActive === false) {
      throw new CustomError(
        ResponseMessages.CATEGORY_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    const { categoryId, ...content } = dto;
    const updatedProduct = product.updateDetails({ ...content, category: categoryId });

    const saved = await this._productRepository.save(updatedProduct);

    if (!saved) {
      throw new CustomError(
        ResponseMessages.PRODUCT_UPDATE_FAILED,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
