
import type { GetAllQueryDto } from "../../../../core/shared/dtos/get.all.doc.dto.js";
import type { Category } from "../../entities/category.entity.js";

export interface IGetAllCategoryUseCase {
  execute(dto: GetAllQueryDto): Promise<{ data: Category[]; total: number }>;
}
