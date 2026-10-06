import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import type { ICategoryRepository } from "../repositories/category.repository.interface.js";
import type { IUnblockCategoryUseCase } from "./interfaces/unblock.category.use-case.interface.js";

@injectable()
export class UnblockCategoryUseCase implements IUnblockCategoryUseCase {
  constructor(
    @inject("ICategoryRepository")
    private readonly _categoryRepository: ICategoryRepository
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this._categoryRepository.findById(id);

    if (!category) {
      throw new CustomError(
        ResponseMessages.CATEGORY_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    if (category.isActive) {
      throw new CustomError(
        ResponseMessages.CATEGORY_ALREADY_ACTIVE,
        HttpStatusCode.BAD_REQUEST
      );
    }

    const activated = category.activate();
    await this._categoryRepository.save(activated);
  }
}
