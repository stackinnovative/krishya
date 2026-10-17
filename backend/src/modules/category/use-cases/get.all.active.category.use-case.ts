import { inject, injectable } from "tsyringe";

import type { IGetAllActiveCategoryUseCase } from "./interfaces/get.all.active.category.use-case.interface.js";
import type { ICategoryRepository } from "../repositories/category.repository.interface.js";
import type { CategoryUserView } from "../types/category.type.js";


@injectable()
export class GetAllActiveCategoryUseCase
  implements IGetAllActiveCategoryUseCase
{
  constructor(
    @inject("ICategoryRepository")
    private readonly _categoryRepository: ICategoryRepository
  ) {}

  async execute(): Promise<CategoryUserView[]> {
    return this._categoryRepository.findAllActiveForUser();
  }
}
