import { Types } from "mongoose";
import { Product } from "../entities/product.entity.js";
import type {
  AdminVariantView,
  IImage,
  IIngredient,
  IVariant,
  ProductListView,
  ProductType,
  ProductView,
  UserProductListView,
  UserProductView,
  UserVariantView,
} from "../types/product.type.js";

type Id = { toString(): string };

export type VariantRecord = Omit<IVariant, "_id"> & { _id: Id };

export type PopulatedCategory = { _id: Id; name: string; slug?: string };

/** A product as `.lean()` returns it - `category` is an id, or the populated { name, slug } on admin/detail reads. */
export type ProductRecord = {
  _id: Id;
  name: string;
  slug: string;
  category: Id | PopulatedCategory | null;
  type: ProductType;
  shortDescription: string;
  description: string;
  ingredients?: IIngredient[];
  howToUse?: string;
  storage?: string;
  badge?: string;
  images?: IImage[];
  variants?: VariantRecord[];
  defaultVariantId?: Id | null;
  defaultPrice?: number;
  defaultMrp?: number;
  defaultDiscountPercent?: number;
  isActive: boolean;
  isFeatured: boolean;
};

/** The non-variant fields a details edit writes - variants change only through their own endpoints, so an edit never overwrites live stock. */
export type ProductDetailsPersistence = Pick<
  ProductRecord,
  "name" | "type" | "shortDescription" | "description" | "ingredients" | "howToUse" | "storage" | "badge" | "images" | "isActive" | "isFeatured"
> & { category: Types.ObjectId };

export type ProductPersistence = ProductDetailsPersistence & {
  slug: string;
  variants: (Omit<IVariant, "_id"> & { _id: Types.ObjectId })[];
};

const isPopulated = (category: ProductRecord["category"]): category is PopulatedCategory =>
  !!category && typeof category === "object" && "name" in category;

const categoryId = (category: ProductRecord["category"]): string =>
  isPopulated(category) ? category._id.toString() : (category?.toString() ?? "");

const toAdminVariant = (variant: VariantRecord, defaultVariantId: string | null): AdminVariantView => ({
  variantId: variant._id.toString(),
  quantity: variant.quantity,
  unit: variant.unit,
  mrp: variant.mrp,
  price: variant.price,
  discountPercent: variant.discountPercent ?? 0,
  stock: variant.stock,
  isActive: variant.isActive !== false,
  isDefault: variant._id.toString() === defaultVariantId,
});

const toUserVariant = (variant: VariantRecord): UserVariantView => ({
  variantId: variant._id.toString(),
  quantity: variant.quantity,
  unit: variant.unit,
  mrp: variant.mrp,
  price: variant.price,
  discountPercent: variant.discountPercent ?? 0,
  stock: variant.stock,
});

const content = (record: ProductRecord) => ({
  id: record._id.toString(),
  name: record.name,
  slug: record.slug,
  type: record.type,
  shortDescription: record.shortDescription,
  description: record.description,
  ingredients: (record.ingredients ?? []).map((i) => ({ name: i.name, ...(i.botanicalName ? { botanicalName: i.botanicalName } : {}) })),
  howToUse: record.howToUse ?? "",
  storage: record.storage ?? "",
  badge: record.badge ?? "",
  defaultVariantId: record.defaultVariantId?.toString() ?? null,
});

export class ProductMapper {
  static toDomain(record: ProductRecord | null): Product | null {
    if (!record) return null;

    return new Product({
      id: record._id.toString(),
      name: record.name,
      slug: record.slug,
      category: categoryId(record.category),
      type: record.type,
      shortDescription: record.shortDescription,
      description: record.description,
      ingredients: record.ingredients ?? [],
      howToUse: record.howToUse,
      storage: record.storage,
      badge: record.badge,
      images: record.images ?? [],
      variants: (record.variants ?? []).map((v) => ({
        id: v._id.toString(),
        quantity: v.quantity,
        unit: v.unit,
        mrp: v.mrp,
        price: v.price,
        stock: v.stock,
        isActive: v.isActive,
      })),
      defaultVariantId: record.defaultVariantId?.toString() ?? null,
      isActive: record.isActive,
      isFeatured: record.isFeatured,
    });
  }

  static toDetailsPersistence(product: Product): ProductDetailsPersistence {
    return {
      name: product.name,
      category: new Types.ObjectId(product.category),
      type: product.type,
      shortDescription: product.shortDescription,
      description: product.description,
      ingredients: product.ingredients,
      howToUse: product.howToUse,
      storage: product.storage,
      badge: product.badge,
      images: product.images,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    };
  }

  /** Full document for an insert. New variants get their ids here, so the caller can point defaultVariantId at one without a second query. */
  static toPersistence(product: Product): ProductPersistence {
    return {
      ...ProductMapper.toDetailsPersistence(product),
      slug: product.slug,
      variants: product.variants.map((v) => ({
        _id: v.id ? new Types.ObjectId(v.id) : new Types.ObjectId(),
        quantity: v.quantity,
        unit: v.unit,
        mrp: v.mrp,
        price: v.price,
        discountPercent: v.discountPercent ?? 0,
        stock: v.stock,
        isActive: v.isActive ?? true,
      })),
    };
  }

  static toAdminView(record: ProductRecord | null): ProductView | null {
    if (!record || !isPopulated(record.category)) return null;
    const base = content(record);

    return {
      ...base,
      category: { id: record.category._id.toString(), name: record.category.name },
      images: (record.images ?? []).map((i) => ({ url: i.url, publicId: i.publicId })),
      variants: (record.variants ?? []).map((v) => toAdminVariant(v, base.defaultVariantId)),
      isActive: record.isActive,
      isFeatured: record.isFeatured,
    };
  }

  static toAdminListView(record: ProductRecord): ProductListView | null {
    if (!isPopulated(record.category)) return null;

    return {
      id: record._id.toString(),
      name: record.name,
      slug: record.slug,
      type: record.type,
      shortDescription: record.shortDescription,
      price: record.defaultPrice ?? 0,
      mrp: record.defaultMrp ?? 0,
      discountPercent: record.defaultDiscountPercent ?? 0,
      image: record.images?.[0]?.url,
      category: { id: record.category._id.toString(), name: record.category.name },
      isActive: record.isActive,
      isFeatured: record.isFeatured,
    };
  }

  /* ================= USER DETAIL VIEW ================= */
  static toUserView(record: ProductRecord | null): UserProductView | null {
    if (!record || !isPopulated(record.category)) return null;

    return {
      ...content(record),
      category: {
        id: record.category._id.toString(),
        name: record.category.name,
        slug: record.category.slug ?? "",
      },
      images: (record.images ?? []).map((i) => ({ url: i.url })),
      variants: (record.variants ?? []).filter((v) => v.isActive !== false).map(toUserVariant),
    };
  }

  /* ================= USER LIST VIEW (INFINITE SCROLL) ================= */
  static toUserListView(record: ProductRecord): UserProductListView {
    return {
      id: record._id.toString(),
      name: record.name,
      slug: record.slug,
      type: record.type,
      shortDescription: record.shortDescription,
      badge: record.badge ?? "",
      image: record.images?.[0]?.url ?? "",
      defaultVariantId: record.defaultVariantId?.toString() ?? null,
      price: record.defaultPrice ?? 0,
      mrp: record.defaultMrp ?? 0,
      discountPercent: record.defaultDiscountPercent ?? 0,
      variantCount: (record.variants ?? []).filter((v) => v.isActive !== false).length,
    };
  }

  static toVariantView(variant: VariantRecord, defaultVariantId: Id | null | undefined): AdminVariantView {
    return toAdminVariant(variant, defaultVariantId?.toString() ?? null);
  }
}
