import { Types } from "mongoose";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { CustomError } from "../../../core/errors/custom.error.js";

import { Product } from "../entities/product.entity.js";
import { ProductModel } from "../infrastructure/product.schema.js";
import type { IProductRepository } from "./product.repository.interface.js";
import { ProductMapper } from "../mappers/product.mapper.js";
import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";
import type {
  AddColorOptionProps,
  AddVariantProps,
  AdminVariantView,
  EditColorOptionProps,
  PaginatedUserProductList,
  ProductListView,
  ProductView,
  StockUpdateProps,
  UpdateVariantParams,
  UserProductListView,
  UserProductView,
} from "../types/product.type.js";
import type { ClientSession } from "mongoose";

const { ObjectId } = Types;

export class ProductRepository implements IProductRepository {
  /** Points defaultVariantId/defaultPrice at a specific variant. Cheap: single-doc update by _id. */
  private async _setDefaultVariant(
    productId: Types.ObjectId | string,
    defaultVariantId: Types.ObjectId,
    defaultPrice: number,
    session?: ClientSession,
  ): Promise<void> {
    await ProductModel.updateOne(
      { _id: productId },
      { $set: { defaultVariantId, defaultPrice } },
      session ? { session } : undefined,
    );
  }

  async create(productEntity: Product, defaultVariantIndex: number): Promise<Product> {
    const persistenceData = ProductMapper.toPersistence(productEntity);

    // Every variant here is brand new (no _id yet) - assign ids up front so
    // we know exactly which one to point defaultVariantId at, without a
    // second lookup/match query after insert.
    let flatIndex = 0;
    let defaultVariantId: Types.ObjectId | null = null;
    let defaultPrice = 0;
    for (const color of persistenceData.colorOptions) {
      for (const variant of color.variants) {
        const id = new ObjectId();
        variant._id = id;
        if (flatIndex === defaultVariantIndex) {
          defaultVariantId = id;
          defaultPrice = variant.price;
        }
        flatIndex++;
      }
    }
    persistenceData.defaultVariantId = defaultVariantId;
    persistenceData.defaultPrice = defaultPrice;

    const created = await ProductModel.create(persistenceData);

    const domainProduct = ProductMapper.toDomain(created);
    if (!domainProduct) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    return domainProduct;
  }

  async findById(id: string, session: ClientSession): Promise<Product | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    const query = ProductModel.findById(id).lean();

    if (session) {
      query.session(session);
    }

    const foundDocument = await query;
    return ProductMapper.toDomain(foundDocument);
  }

  async save(productEntity: Product): Promise<Product> {
    if (!productEntity.id) {
      throw new CustomError(
        ResponseMessages.ID_MISSING,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const persistenceData = ProductMapper.toPersistence(productEntity);

    const updatedDocument = await ProductModel.findByIdAndUpdate(
      productEntity.id,
      { $set: persistenceData },
      { new: true },
    ).lean();

    if (!updatedDocument) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    const domainProduct = ProductMapper.toDomain(updatedDocument);
    if (!domainProduct) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    return domainProduct;
  }

  async findAllForAdmin(allDoc: IGetAllDocDB): Promise<ProductListView[]> {
    const { query, page, limit, sort } = allDoc;
    const skip = (page - 1) * limit;

    const documents = await ProductModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("category", "name")
      .lean();

    return documents
      .map(ProductMapper.toAdminListView)
      .filter((p): p is ProductListView => p !== null);
  }

  async countDocument(query: Record<string, any>): Promise<number> {
    return ProductModel.countDocuments(query);
  }

  /* ================= ADMIN: FULL PRODUCT ================= */
  async findProductForAdmin(id: string): Promise<ProductView | null> {
    if (!ObjectId.isValid(id)) return null;

    const document = await ProductModel.findById(id)
      .populate("category", "name")
      .lean();

    return ProductMapper.toAdminView(document);
  }

  async findProductForUser(id: string): Promise<UserProductView | null> {
    if (!ObjectId.isValid(id)) return null;

    const document = await ProductModel.findOne({
      _id: id,
      isActive: true,
    }).lean();

    return ProductMapper.toUserView(document);
  }

  async addVariants(
    productId: string,
    colorOptionId: string,
    variants: AddVariantProps[],
  ): Promise<Product | null> {
    const toInsert = variants.map((v) => ({
      _id: new ObjectId(),
      size: v.size,
      stock: v.stock,
      price: v.price,
      isActive: v.isActive ?? true,
    }));

    const updated = await ProductModel.findOneAndUpdate(
      { _id: productId, "colorOptions._id": colorOptionId },
      {
        $push: {
          "colorOptions.$.variants": { $each: toInsert },
        },
      },
      { new: true },
    ).lean();

    if (updated) {
      const defaultIndex = variants.findIndex((v) => v.isDefault);
      if (defaultIndex !== -1) {
        const target = toInsert[defaultIndex]!;
        await this._setDefaultVariant(updated._id, target._id, target.price);
      }
    }

    return ProductMapper.toDomain(updated);
  }

  async addColorOption(
    productId: string,
    dto: AddColorOptionProps,
  ): Promise<Product | null> {
    const variantDocs = dto.variants.map((v) => ({
      _id: new ObjectId(),
      size: v.size,
      stock: v.stock,
      price: v.price,
      isActive: v.isActive ?? true,
    }));

    const updated = await ProductModel.findByIdAndUpdate(
      productId,
      {
        $push: {
          colorOptions: {
            colorName: dto.colorName,
            hex: dto.hex,
            images: dto.images ?? [],
            variants: variantDocs,
          },
        },
      },
      { new: true, runValidators: true },
    ).lean();

    if (updated) {
      const defaultIndex = dto.variants.findIndex((v) => v.isDefault);
      if (defaultIndex !== -1) {
        const target = variantDocs[defaultIndex]!;
        await this._setDefaultVariant(updated._id, target._id, target.price);
      }
    }

    return ProductMapper.toDomain(updated);
  }

  async updateColorOptionById(
    productId: string,
    colorOptionId: string,
    data: EditColorOptionProps,
  ): Promise<Product | null> {
    const $set: Record<string, any> = {};
    if (data.colorName !== undefined) $set["colorOptions.$[color].colorName"] = data.colorName;
    if (data.hex !== undefined) $set["colorOptions.$[color].hex"] = data.hex;
    if (data.images !== undefined) $set["colorOptions.$[color].images"] = data.images;

    const updated = await ProductModel.findOneAndUpdate(
      { _id: productId },
      { $set },
      {
        arrayFilters: [{ "color._id": colorOptionId }],
        new: true,
        runValidators: true,
      },
    ).lean();

    return ProductMapper.toDomain(updated);
  }

  async updateVariantById(
    params: UpdateVariantParams,
  ): Promise<Product | null> {
    const { productId, variantId, data } = params;

    const updated = await ProductModel.findOneAndUpdate(
      { _id: productId },
      {
        $set: {
          "colorOptions.$[].variants.$[variant].stock": data.stock,
          "colorOptions.$[].variants.$[variant].price": data.price,
          "colorOptions.$[].variants.$[variant].isActive": data.isActive,
        },
      },
      {
        arrayFilters: [{ "variant._id": variantId }],
        new: true,
        runValidators: true,
      },
    ).lean();

    if (updated) {
      const becomingDefault = data.isDefault === true;
      const staysDefault = !becomingDefault && updated.defaultVariantId?.toString() === variantId;
      if (becomingDefault || staysDefault) {
        await this._setDefaultVariant(updated._id, new ObjectId(variantId), data.price);
      }
    }

    return ProductMapper.toDomain(updated);
  }

  async findProductVariant(
    productId: string,
    variantId: string,
    isActive?: boolean,
  ): Promise<AdminVariantView | null> {
    const query: Record<string, any> = {
      _id: new Types.ObjectId(productId),
    };
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    const document = await ProductModel.aggregate([
      { $match: query },
      { $unwind: "$colorOptions" },
      { $unwind: "$colorOptions.variants" },
      { $match: { "colorOptions.variants._id": new Types.ObjectId(variantId) } },
      {
        $project: {
          _id: 0,
          variant: "$colorOptions.variants",
          colorOptionId: "$colorOptions._id",
          colorName: "$colorOptions.colorName",
          defaultVariantId: "$defaultVariantId",
        },
      },
    ]);
    const data = document?.[0];
    if (!data?.variant) return null;
    return ProductMapper.toVariantView({
      ...data.variant,
      colorOptionId: data.colorOptionId,
      colorName: data.colorName,
      defaultVariantId: data.defaultVariantId,
    });
  }

  async findFeaturedProducts(): Promise<UserProductListView[]> {
    const documents = await ProductModel.find({
      isActive: true,
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return documents
      .map(ProductMapper.toUserListView)
      .filter((p): p is UserProductListView => p !== null);
  }

  async findAllForUser(allDoc: IGetAllDocDB): Promise<PaginatedUserProductList> {
    const { query, limit, sort, page } = allDoc;

    const skip = (page - 1) * limit;

    // Fetch one extra document instead of running a second countDocuments()
    // query to compute hasMore - countDocuments is one of the more expensive
    // Mongo operations, and the exact total is never actually returned to
    // the client (PaginatedUserProductList only has data/nextPage/hasMore),
    // so it was paying for a full count on every request just to derive a
    // boolean. This halves the DB round-trips per list request.
    const documents = await ProductModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit + 1)
      .lean();

    const hasMore = documents.length > limit;
    const pageDocuments = hasMore ? documents.slice(0, limit) : documents;

    const data = pageDocuments
      .map(ProductMapper.toUserListView)
      .filter((p): p is UserProductListView => p !== null);

    return {
      data,
      nextPage: hasMore ? page + 1 : null,
      hasMore
    };
  }

  async findRelatedProducts(categoryId: string, excludeProductId?: string): Promise<UserProductListView[]> {
    const documents = await ProductModel.find({
      isActive: true,
      category: categoryId,
      ...(excludeProductId && ObjectId.isValid(excludeProductId)
        ? { _id: { $ne: new ObjectId(excludeProductId) } }
        : {}),
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return documents
      .map(ProductMapper.toUserListView)
      .filter((p): p is UserProductListView => p !== null);
  }

  async findByCategoryIds(categoryIds: string[], limit: number): Promise<UserProductListView[]> {
    if (categoryIds.length === 0) return [];

    const documents = await ProductModel.find({
      isActive: true,
      category: { $in: categoryIds.map((id) => new ObjectId(id)) },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return documents
      .map(ProductMapper.toUserListView)
      .filter((p): p is UserProductListView => p !== null);
  }

  async findByIds(ids: string[]): Promise<UserProductListView[]> {
    if (ids.length === 0) return [];

    const documents = await ProductModel.find({
      _id: { $in: ids.map((id) => new ObjectId(id)) },
      isActive: true,
    }).lean();

    return documents
      .map(ProductMapper.toUserListView)
      .filter((p): p is UserProductListView => p !== null);
  }

  async decrementStock(params: StockUpdateProps): Promise<void> {
    const { productId, variantId, quantity, session } = params;

    await ProductModel.updateOne(
      {
        _id: new Types.ObjectId(productId),
      },
      {
        $inc: {
          "colorOptions.$[].variants.$[variant].stock": -quantity,
        },
      },
      {
        arrayFilters: [{ "variant._id": new Types.ObjectId(variantId) }],
        ...(session && { session }),
      },
    );
  }

  async incrementStock(params: StockUpdateProps): Promise<void> {

    const { productId, variantId, quantity, session } = params;

    await ProductModel.updateOne(
      {
        _id: new Types.ObjectId(productId),
      },
      {
        $inc: {
          "colorOptions.$[].variants.$[variant].stock": quantity,
        },
      },
      {
        arrayFilters: [
          { "variant._id": new Types.ObjectId(variantId) },
        ],
        ...(session && { session }),
      },
    );
  }
}
