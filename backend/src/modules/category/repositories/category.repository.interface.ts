import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";
import type { IdName } from "../../../core/shared/types/id.name.type.js";
import { Category } from "../entities/category.entity.js";
import type { CategorySignature } from "../types/category.type.js";

export interface ICategoryRepository {
  create(categoryEntity: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  save(categoryEntity: Category): Promise<Category>;
  findAllForAdmin(allDoc: IGetAllDocDB): Promise<Category[]>;
  findAllActiveForUser(): Promise<IdName[]>;
  countDocument(query: Record<string, any>): Promise<number>;
  findSignatureCategories(): Promise<CategorySignature[]>;
}
