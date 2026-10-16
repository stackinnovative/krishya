import { Types, type ClientSession } from "mongoose";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { CustomError } from "../../../core/errors/custom.error.js";

import { Product } from "../entities/product.entity.js";
import { ProductModel } from "../infrastructure/product.schema.js";
import type { IProductRepository } from "./product.repository.interface.js";
import { ProductMapper, type ProductRecord, type VariantRecord } from "../mappers/product.mapper.js";
import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";
import type {
  AddVariantProps,
  AdminVariantView,
  PaginatedUserProductList,
  ProductListView,
  ProductView,
  StockUpdateProps,
  UpdateVariantParams,
  UserProductListView,
  UserProductView,
} from "../types/product.type.js";
import { calcDiscountPercent } from "../utils/variant.helper.js";

const { ObjectId } = Types;

type DefaultFields = {
  defaultVariantId: Types.ObjectId | null;
  defaultPrice: number;
  defaultMrp: number;
  defaultDiscountPercent: number;
};

/**
 * Which variant a product opens on: the one admin just asked for, else the
 * current default if it's still on sale, else the first one on sale, else the
 * first one at all - so a product never points at a deleted or switched-off
 * quantity, and its list price always matches what the detail page selects.
 */
const pickDefaults = (variants: VariantRecord[], currentId: string | null, preferredId?: string): DefaultFields => {
  const byId = (id: string | null | undefined) => (id ? variants.find((v) => v._id.toString() === id) : undefined);
  const preferred = byId(preferredId);
  const current = byId(currentId);
  const chosen =
    (preferred && preferred.isActive !== false ? preferred : undefined) ??
    (current && current.isActive !== false ? current : undefined) ??
    variants.find((v) => v.isActive !== false) ??
    variants[0];

  if (!chosen) return { defaultVariantId: null, defaultPrice: 0, defaultMrp: 0, defaultDiscountPercent: 0 };
  return {
    defaultVariantId: new ObjectId(chosen._id.toString()),
    defaultPrice: chosen.price,
    defaultMrp: chosen.mrp,
    defaultDiscountPercent: chosen.discountPercent ?? 0,
  };
};

const toVariantDoc = (v: AddVariantProps) => ({
  _id: new ObjectId(),
  quantity: v.quantity,
  unit: v.unit,
  mrp: v.mrp,
  price: v.price,
  discountPercent: calcDiscountPercent(v.mrp, v.price),
  stock: v.stock,
  isActive: v.isActive,
});

const mapList = (records: ProductRecord[]): UserProductListView[] => records.map(ProductMapper.toUserListView);

export class ProductRepository implements IProductRepository {
  /** Re-points the default variant and copies its price/MRP/discount onto the product. Called after every variant write. */
  private async _syncDefaults(productId: Types.ObjectId | string, preferredId?: string, session?: ClientSession): Promise<ProductRecord | null> {
    const query = ProductModel.findById(productId, { variants: 1, defaultVariantId: 1 }).lean<ProductRecord>();
    if (session) query.session(session);
    const record = await query;
    if (!record) return null;

    const defaults = pickDefaults(record.variants ?? [], record.defaultVariantId?.toString() ?? null, preferredId);
    return ProductModel.findByIdAndUpdate(productId, { $set: defaults }, { new: true, ...(session && { session }) }).lean<ProductRecord>();
  }

  async create(productEntity: Product, defaultVariantIndex: number): Promise<Product> {
    const persistenceData = ProductMapper.toPersistence(productEntity);
    const defaults = pickDefaults(persistenceData.variants, null, persistenceData.variants[defaultVariantIndex]?._id.toString());

    const created = await ProductModel.create({ ...persistenceData, ...defaults });

    const domainProduct = ProductMapper.toDomain(created.toObject<ProductRecord>());
    if (!domainProduct) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    return domainProduct;
  }

  async findById(id: string, session?: ClientSession): Promise<Product | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    const query = ProductModel.findById(id).lean<ProductRecord>();

    if (session) {
      query.session(session);
    }

    return ProductMapper.toDomain(await query);
  }

  async isSlugTaken(slug: string): Promise<boolean> {
    return (await ProductModel.exists({ slug })) !== null;
  }

  async save(productEntity: Product): Promise<Product> {
    if (!productEntity.id) {
      throw new CustomError(
        ResponseMessages.ID_MISSING,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const updatedDocument = await ProductModel.findByIdAndUpdate(
      productEntity.id,
      { $set: ProductMapper.toDetailsPersistence(productEntity) },
      { new: true },
    ).lean<ProductRecord>();

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
      .lean<ProductRecord[]>();

    return documents
      .map(ProductMapper.toAdminListView)
      .filter((p): p is ProductListView => p !== null);
  }

  async countDocument(query: Record<string, unknown>): Promise<number> {
    return ProductModel.countDocuments(query);
  }

  /* ================= ADMIN: FULL PRODUCT ================= */
  async findProductForAdmin(id: string): Promise<ProductView | null> {
    if (!ObjectId.isValid(id)) return null;

    const document = await ProductModel.findById(id)
      .populate("category", "name")
      .lean<ProductRecord>();

    return ProductMapper.toAdminView(document);
  }

  async findProductForUser(id: string): Promise<UserProductView | null> {
    if (!ObjectId.isValid(id)) return null;

    const document = await ProductModel.findOne({ _id: id, isActive: true })
      .populate("category", "name slug")
      .lean<ProductRecord>();

    return ProductMapper.toUserView(document);
  }

  async findProductForUserBySlug(slug: string): Promise<UserProductView | null> {
    const document = await ProductModel.findOne({ slug: slug.toLowerCase(), isActive: true })
      .populate("category", "name slug")
      .lean<ProductRecord>();

    return ProductMapper.toUserView(document);
  }

  async addVariants(productId: string, variants: AddVariantProps[]): Promise<Product | null> {
    const toInsert = variants.map(toVariantDoc);

    const updated = await ProductModel.findByIdAndUpdate(
      productId,
      { $push: { variants: { $each: toInsert } } },
      { new: true, runValidators: true },
    ).lean<ProductRecord>();
    if (!updated) return null;

    const defaultIndex = variants.findIndex((v) => v.isDefault);
    const synced = await this._syncDefaults(updated._id.toString(), toInsert[defaultIndex]?._id.toString());
    return ProductMapper.toDomain(synced);
  }

  async updateVariantById(params: UpdateVariantParams): Promise<Product | null> {
    const { productId, variantId, data } = params;

    const updated = await ProductModel.findOneAndUpdate(
      { _id: productId },
      {
        $set: {
          "variants.$[variant].quantity": data.quantity,
          "variants.$[variant].unit": data.unit,
          "variants.$[variant].mrp": data.mrp,
          "variants.$[variant].price": data.price,
          "variants.$[variant].discountPercent": calcDiscountPercent(data.mrp, data.price),
          "variants.$[variant].stock": data.stock,
          "variants.$[variant].isActive": data.isActive,
        },
      },
      {
        arrayFilters: [{ "variant._id": new ObjectId(variantId) }],
        new: true,
        runValidators: true,
      },
    ).lean<ProductRecord>();
    if (!updated) return null;

    // Re-sync even when this variant isn't becoming the default: if it *is*
    // the default, its new price must reach the list views; if it was just
    // switched off, the default must move to one that's still on sale.
    const synced = await this._syncDefaults(updated._id.toString(), data.isDefault ? variantId : undefined);
    return ProductMapper.toDomain(synced);
  }

  async findProductVariant(
    productId: string,
    variantId: string,
    isActive?: boolean,
  ): Promise<AdminVariantView | null> {
    if (!ObjectId.isValid(productId) || !ObjectId.isValid(variantId)) return null;

    const record = await ProductModel.findOne(
      { _id: productId, ...(isActive !== undefined && { isActive }) },
      { variants: 1, defaultVariantId: 1 },
    ).lean<ProductRecord>();

    const variant = record?.variants?.find((v) => v._id.toString() === variantId);
    if (!record || !variant) return null;
    return ProductMapper.toVariantView(variant, record.defaultVariantId);
  }

  async findFeaturedProducts(): Promise<UserProductListView[]> {
    const documents = await ProductModel.find({
      isActive: true,
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean<ProductRecord[]>();

    return mapList(documents);
  }

  async findAllForUser(allDoc: IGetAllDocDB): Promise<PaginatedUserProductList> {
    const { query, limit, sort, page } = allDoc;

    const skip = (page - 1) * limit;

    // Fetch one extra document instead of running a second countDocuments()
    // query to compute hasMore - the exact total is never returned to the
    // client (PaginatedUserProductList only has data/nextPage/hasMore), so
    // this halves the DB round-trips per list request.
    const documents = await ProductModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit + 1)
      .lean<ProductRecord[]>();

    const hasMore = documents.length > limit;
    const pageDocuments = hasMore ? documents.slice(0, limit) : documents;

    return {
      data: mapList(pageDocuments),
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
      .lean<ProductRecord[]>();

    return mapList(documents);
  }

  async findByCategoryIds(categoryIds: string[], limit: number): Promise<UserProductListView[]> {
    if (categoryIds.length === 0) return [];

    const documents = await ProductModel.find({
      isActive: true,
      category: { $in: categoryIds.map((id) => new ObjectId(id)) },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<ProductRecord[]>();

    return mapList(documents);
  }

  async findByIds(ids: string[]): Promise<UserProductListView[]> {
    if (ids.length === 0) return [];

    const documents = await ProductModel.find({
      _id: { $in: ids.map((id) => new ObjectId(id)) },
      isActive: true,
    }).lean<ProductRecord[]>();

    return mapList(documents);
  }

  async decrementStock(params: StockUpdateProps): Promise<void> {
    const { productId, variantId, quantity, session } = params;

    await ProductModel.updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { "variants.$[variant].stock": -quantity } },
      {
        arrayFilters: [{ "variant._id": new ObjectId(variantId) }],
        ...(session && { session }),
      },
    );
  }

  async incrementStock(params: StockUpdateProps): Promise<void> {
    const { productId, variantId, quantity, session } = params;

    await ProductModel.updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { "variants.$[variant].stock": quantity } },
      {
        arrayFilters: [{ "variant._id": new ObjectId(variantId) }],
        ...(session && { session }),
      },
    );
  }
}
