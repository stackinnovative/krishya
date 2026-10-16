import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import { Category } from "../entities/category.entity.js";
import type { ICreateCategoryUseCase } from "./interfaces/create.category.use-case.interface.js";
import type { ICategoryRepository } from "../repositories/category.repository.interface.js";
import type { CreateCategoryRequestDto } from "../dtos/create.category.dto.js";
import { toSlug } from "../../../core/utils/to.slug.helper.js";
import { CATEGORY_LIMITS } from "../types/category.type.js";


@injectable()
export class CreateCategoryUseCase implements ICreateCategoryUseCase {
  constructor(
    @inject("ICategoryRepository")
    private readonly _categoryRepository: ICategoryRepository
  ) {}

  async execute(dto: CreateCategoryRequestDto): Promise<void> {
    /* ---------- duplicate name validation ---------- */
    const existingCategory = await this._categoryRepository.findByName(dto.name);

    if (existingCategory) {
      throw new CustomError(
        ResponseMessages.CATEGORY_NAME_ALREADY_EXISTS,
        HttpStatusCode.BAD_REQUEST
      );
    }

    /* ---------- create category entity ---------- */
    const categoryEntity = new Category({
      id: null,
      name: dto.name,
      slug: await this.uniqueSlug(dto.name),
      description: dto.description,
      icon: dto.icon,
      sortOrder: dto.sortOrder,
      isActive: true,
    });

    const category = await this._categoryRepository.create(categoryEntity);

    if (!category) {
      throw new CustomError(
        ResponseMessages.CATEGORY_CREATE_FAILED,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /** "Hair Care" -> "hair-care", or "hair-care-2" when another category already owns it. */
  private async uniqueSlug(name: string): Promise<string> {
    const base = toSlug(name, CATEGORY_LIMITS.slug - 4);
    let slug = base;
    for (let n = 2; await this._categoryRepository.isSlugTaken(slug); n++) {
      slug = `${base}-${n}`;
    }
    return slug;
  }
}
