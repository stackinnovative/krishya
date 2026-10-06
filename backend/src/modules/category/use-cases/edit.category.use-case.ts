import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import { Category } from "../entities/category.entity.js";
import type { IEditCategoryUseCase } from "./interfaces/edit.category.use-case.interface.js";
import type { ICategoryRepository } from "../repositories/category.repository.interface.js";
import type { CreateCategoryRequestDto } from "../dtos/create.category.dto.js";


@injectable()
export class EditCategoryUseCase implements IEditCategoryUseCase {
  constructor(
    @inject("ICategoryRepository")
    private readonly _categoryRepository: ICategoryRepository
  ) {}

  async execute(id: string, dto: CreateCategoryRequestDto): Promise<void> {
    //  Fetch existing category
    const existing = await this._categoryRepository.findById(id);

    if (!existing) {
      throw new CustomError(
        ResponseMessages.CATEGORY_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    //  Duplicate name validation (exclude self)
    if (existing.name !== dto.name) {
      const conflict = await this._categoryRepository.findByName(dto.name);

      if (conflict && conflict.id !== existing.id) {
        throw new CustomError(
          ResponseMessages.CATEGORY_NAME_ALREADY_EXISTS,
          HttpStatusCode.BAD_REQUEST
        );
      }
    }

    //  Rebuild domain entity (immutable update)
    const updated = new Category({
      id: existing.id,
      name: dto.name,
      description: dto.description,
      isActive: existing.isActive,
    });

    //  Persist
    await this._categoryRepository.save(updated);
  }
}
