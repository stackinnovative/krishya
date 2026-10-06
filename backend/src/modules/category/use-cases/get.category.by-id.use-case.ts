import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import type { IGetCategoryByIdUseCase } from "./interfaces/get.category.by-id.use-case.interface.js";
import type { ICategoryRepository } from "../repositories/category.repository.interface.js";
import type { Category } from "../entities/category.entity.js";

@injectable()
export class GetCategoryByIdUseCase implements IGetCategoryByIdUseCase {
  constructor(
    @inject("ICategoryRepository")
    private readonly _categoryRepository: ICategoryRepository
  ) {}

  async execute(id: string): Promise<Category> {
    const category = await this._categoryRepository.findById(id);

    if (!category) {
      throw new CustomError(
        ResponseMessages.CATEGORY_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    return category;
  }
}
