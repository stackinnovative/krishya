import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { CustomError } from "../../../core/errors/custom.error.js";

import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";
import { Category } from "../entities/category.entity.js";
import { CategoryModel } from "../infrastructure/category.schema.js";
import type { ICategoryRepository } from "./category.repository.interface.js";
import { CategoryMapper } from "../mappers/category.mapper.js";
import type { IdName } from "../../../core/shared/types/id.name.type.js";
import type { CategorySignature } from "../types/category.type.js";

export class CategoryRepository implements ICategoryRepository {
  async create(categoryEntity: Category): Promise<Category> {
    const persistenceData = CategoryMapper.toPersistence(categoryEntity);
    const created = await CategoryModel.create(persistenceData);

    const domainCategory = CategoryMapper.toDomain(created);
    if (!domainCategory) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    return domainCategory;
  }

  async findById(id: string): Promise<Category | null> {
    const foundDocument = await CategoryModel.findOne({ _id: id }).lean();
    return CategoryMapper.toDomain(foundDocument);
  }

  async findByName(name: string): Promise<Category | null> {
    const foundDocument = await CategoryModel.findOne({ name }).lean();
    return CategoryMapper.toDomain(foundDocument);
  }

  async save(categoryEntity: Category): Promise<Category> {
    if (!categoryEntity.id) {
      throw new CustomError(
        ResponseMessages.ID_MISSING,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const persistenceData = CategoryMapper.toPersistence(categoryEntity);

    const updatedDocument = await CategoryModel.findByIdAndUpdate(
      categoryEntity.id,
      { $set: persistenceData },
      { new: true },
    ).lean();

    if (!updatedDocument) {
      throw new CustomError(
        ResponseMessages.CATEGORY_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    const domainCategory = CategoryMapper.toDomain(updatedDocument);
    if (!domainCategory) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    return domainCategory;
  }

  async findAllForAdmin(allDoc: IGetAllDocDB): Promise<Category[]> {
    const { query, page, limit, sort } = allDoc;
    const skip = (page - 1) * limit;

    const documents = await CategoryModel.find(query)
      .sort(sort)
      .collation({ locale: "en", strength: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return documents
      .map(CategoryMapper.toDomain)
      .filter((c): c is Category => c !== null);
  }

  // 🔹 ALL ACTIVE CATEGORIES (USER) - the flat list storefront nav/filters and product browsing pick from.
  async findAllActiveForUser(): Promise<IdName[]> {
    const documents = await CategoryModel.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return documents.map((item) => ({
      id: item._id.toString(),
      name: item.name,
    }));
  }

  async countDocument(query: Record<string, any>): Promise<number> {
    return await CategoryModel.countDocuments(query);
  }

  async findSignatureCategories(): Promise<CategorySignature[]> {
    const signatureCategories = await CategoryModel.aggregate([
      // 1. Active categories only
      {
        $match: {
          isActive: true,
        },
      },

      // 2. Join products belonging directly to this category
      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$categoryId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
            { $limit: 1 },
            {
              $project: {
                colorOptions: 1,
              },
            },
          ],
          as: "product",
        },
      },

      // 3. Keep only categories that actually have a product
      {
        $match: {
          product: { $ne: [] },
        },
      },

      // 4. Grab the matched product's first colour's first photo.
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          categoryName: "$name",
          productImage: {
            $let: {
              vars: {
                firstColorOptions: { $arrayElemAt: ["$product.colorOptions", 0] },
              },
              in: {
                $let: {
                  vars: { firstColor: { $arrayElemAt: ["$$firstColorOptions", 0] } },
                  in: { $arrayElemAt: ["$$firstColor.images", 0] },
                },
              },
            },
          },
        },
      },

      // 5. Limit to 4
      { $limit: 4 },
    ]);
    return signatureCategories
      .map((item) => {
        const imageUrl = item.productImage?.url;
        if (!item.categoryId || !imageUrl) return null;

        return {
          id: item.categoryId.toString(),
          name: item.categoryName,
          image: imageUrl,
        };
      })
      .filter((c): c is CategorySignature => c !== null);
  }
}
