import { Category } from "../entities/category.entity.js";

export class CategoryMapper {
  static toDomain(categoryModelData: any): Category | null {
    if (!categoryModelData) {
      return null;
    }

    const idString =
      categoryModelData._id?.toString() || categoryModelData.id?.toString();

    if (!idString) {
      console.error("Category data from DB is missing an ID:", categoryModelData);
      return null;
    }

    return new Category({
      id: idString,
      name: categoryModelData.name,
      slug: categoryModelData.slug,
      description: categoryModelData.description,
      icon: categoryModelData.icon,
      sortOrder: categoryModelData.sortOrder,
      isActive: categoryModelData.isActive,
    });
  }

  static toPersistence(categoryEntity: Category): any {
    return {
      name: categoryEntity.name,
      slug: categoryEntity.slug,
      description: categoryEntity.description,
      icon: categoryEntity.icon,
      sortOrder: categoryEntity.sortOrder,
      isActive: categoryEntity.isActive,
    };
  }
}
