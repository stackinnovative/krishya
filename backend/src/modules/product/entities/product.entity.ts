import { toSlug } from "../../../core/utils/to.slug.helper.js";
import {
  PRODUCT_LIMITS as L,
  PRODUCT_TYPES,
  VARIANT_UNITS,
  type IImage,
  type IIngredient,
  type ProductType,
  type VariantUnit,
} from "../types/product.type.js";
import { calcDiscountPercent, hasDuplicateVariantSizes } from "../utils/variant.helper.js";

export type ProductVariant = {
  id?: string;
  quantity: number;
  unit: VariantUnit;
  mrp: number;
  price: number;
  /** Always recalculated from mrp/price by the entity - any value passed in is ignored. */
  discountPercent?: number;
  stock: number;
  isActive?: boolean;
};

/** Everything admin edits on the product form (variants have their own endpoints). */
export type ProductContent = {
  name: string;
  category: string;
  type: ProductType;
  shortDescription: string;
  description: string;
  ingredients?: IIngredient[] | undefined;
  howToUse?: string | undefined;
  storage?: string | undefined;
  badge?: string | undefined;
  images: IImage[];
  isFeatured?: boolean;
};

export type ProductProps = ProductContent & {
  id?: string | null;
  slug: string;
  variants: ProductVariant[];
  defaultVariantId?: string | null;
  isActive?: boolean;
};

const fitText = (value: string | undefined, label: string, max: number, min = 0): string => {
  const text = (value ?? "").trim();
  if (text.length < min) throw new Error(min === 1 ? `Product ${label} is required` : `Product ${label} must be at least ${min} characters`);
  if (text.length > max) throw new Error(`Product ${label} cannot exceed ${max} characters`);
  return text;
};

const checkVariant = (variant: ProductVariant): Required<Omit<ProductVariant, "id">> & { id?: string } => {
  if (!Number.isFinite(variant.quantity) || variant.quantity <= 0 || variant.quantity > L.quantityMax) {
    throw new Error("Variant quantity must be more than 0");
  }
  if (!VARIANT_UNITS.includes(variant.unit)) {
    throw new Error(`Variant unit must be one of: ${VARIANT_UNITS.join(", ")}`);
  }
  if (!(variant.mrp > 0) || !(variant.price > 0)) {
    throw new Error("Variant MRP and price must be more than 0");
  }
  if (variant.price > variant.mrp) {
    throw new Error("Variant price cannot be more than its MRP");
  }
  if (!Number.isInteger(variant.stock) || variant.stock < 0) {
    throw new Error("Variant stock must be a whole number, 0 or more");
  }

  return {
    ...(variant.id ? { id: variant.id } : {}),
    quantity: variant.quantity,
    unit: variant.unit,
    mrp: variant.mrp,
    price: variant.price,
    discountPercent: calcDiscountPercent(variant.mrp, variant.price),
    stock: variant.stock,
    isActive: variant.isActive ?? true,
  };
};

export class Product {
  public readonly id: string | null;
  public readonly name: string;
  public readonly slug: string;
  public readonly category: string;
  public readonly type: ProductType;
  public readonly shortDescription: string;
  public readonly description: string;
  public readonly ingredients: IIngredient[];
  public readonly howToUse: string;
  public readonly storage: string;
  public readonly badge: string;
  public readonly images: IImage[];
  public readonly variants: ProductVariant[];
  public readonly defaultVariantId: string | null;
  public readonly isActive: boolean;
  public readonly isFeatured: boolean;

  constructor(props: ProductProps) {
    this.name = fitText(props.name, "name", L.name, L.nameMin);

    this.slug = toSlug(props.slug, L.slug);
    if (!this.slug) throw new Error("Product slug needs at least one letter or number");

    if (!props.category) throw new Error("Product category is required");

    if (!PRODUCT_TYPES.includes(props.type)) {
      throw new Error(`Product type must be one of: ${PRODUCT_TYPES.join(", ")}`);
    }

    this.shortDescription = fitText(props.shortDescription, "short description", L.shortDescription, 1);
    this.description = fitText(props.description, "description", L.description, L.descriptionMin);
    this.howToUse = fitText(props.howToUse, "how to use", L.howToUse);
    this.storage = fitText(props.storage, "storage", L.storage);
    this.badge = fitText(props.badge, "badge", L.badge);

    const ingredients = props.ingredients ?? [];
    if (ingredients.length > L.ingredients) throw new Error(`Product can list at most ${L.ingredients} ingredients`);
    this.ingredients = ingredients.map((item) => {
      const botanicalName = fitText(item.botanicalName, "ingredient botanical name", L.botanicalName);
      return {
        name: fitText(item.name, "ingredient name", L.ingredientName, 1),
        ...(botanicalName ? { botanicalName } : {}),
      };
    });

    if (props.images.length < 1 || props.images.length > L.imagesMax) {
      throw new Error(`Product needs 1 to ${L.imagesMax} photos`);
    }
    this.images = props.images.map((image) => {
      if (!image.url || !image.publicId) throw new Error("Product photo needs both a url and a publicId");
      return { url: image.url, publicId: image.publicId };
    });

    if (props.variants.length < 1 || props.variants.length > L.variantsMax) {
      throw new Error(`Product needs 1 to ${L.variantsMax} variants`);
    }
    if (hasDuplicateVariantSizes(props.variants)) {
      throw new Error("Two variants cannot have the same quantity and unit");
    }

    this.id = props.id ?? null;
    this.category = props.category;
    this.type = props.type;
    this.variants = props.variants.map(checkVariant);
    this.defaultVariantId = props.defaultVariantId ?? null;
    this.isActive = props.isActive ?? true;
    this.isFeatured = props.isFeatured ?? false;
  }

  activate(): Product {
    if (this.isActive) {
      throw new Error("Product already active");
    }

    return new Product({
      ...this,
      isActive: true,
    });
  }

  deactivate(): Product {
    if (!this.isActive) {
      throw new Error("Product already inactive");
    }

    return new Product({
      ...this,
      isActive: false,
    });
  }

  feature(): Product {
    if (this.isFeatured) {
      throw new Error("Product already featured");
    }

    return new Product({
      ...this,
      isFeatured: true,
    });
  }

  unFeature(): Product {
    if (!this.isFeatured) {
      throw new Error("Product is not featured");
    }

    return new Product({
      ...this,
      isFeatured: false,
    });
  }

  /** New name, copy, photos and so on. The slug stays as created so shared links keep working. */
  updateDetails(content: ProductContent): Product {
    return new Product({
      ...this,
      ...content,
    });
  }
}
