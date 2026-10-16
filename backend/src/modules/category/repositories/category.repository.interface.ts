import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";
import { Category } from "../entities/category.entity.js";
import type { CategoryUserView } from "../types/category.type.js";

export interface ICategoryRepository {
  create(categoryEntity: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  isSlugTaken(slug: string): Promise<boolean>;
  save(categoryEntity: Category): Promise<Category>;
  findAllForAdmin(allDoc: IGetAllDocDB): Promise<Category[]>;
  findAllActiveForUser(): Promise<CategoryUserView[]>;
  countDocument(query: Record<string, any>): Promise<number>;
  findSignatureCategories(): Promise<CategoryUserView[]>;
}
