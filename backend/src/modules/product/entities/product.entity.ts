import type { IImage } from "../types/product.type.js";

export type ProductVariant = {
  id?: string;
  size?: string | undefined; // optional: omitted for free-size/no-size-variety colors
  stock: number;
  price: number;
  isActive?: boolean;
};

export type ColorOption = {
  id?: string;
  colorName?: string | undefined; // optional: omitted for colorless products
  hex?: string | undefined;
  images?: IImage[] | undefined;
  variants: ProductVariant[];
};

export type ProductProps = {
  id?: string | null;
  name: string;
  description: string;
  category: string; // sub-category ID
  colorOptions: ColorOption[];
  isActive?: boolean;
  isFeatured?: boolean;
};

export class Product {
  public readonly id: string | null;
  public readonly name: string;
  public readonly description: string;
  public readonly category: string;
  public readonly colorOptions: ColorOption[];
  public readonly isActive: boolean;
  public readonly isFeatured: boolean;

  /** Flattened view across all colors, kept for callers that only need to locate a variant by id. */
  get variants(): ProductVariant[] {
    return this.colorOptions.flatMap((c) => c.variants);
  }

  constructor(props: ProductProps) {
    const name = props.name.trim();

    if (!name) {
      throw new Error("Product name cannot be empty");
    }

    if (name.length < 2 || name.length > 150) {
      throw new Error("Product name must be between 2 and 150 characters");
    }

    if (!props.description?.trim()) {
      throw new Error("Product description is required");
    }

    if (props.description.trim().length > 1000) {
      throw new Error("Product description cannot exceed 1000 characters");
    }

    if (!props.category) {
      throw new Error("Product category is required");
    }

    if (!props.colorOptions || props.colorOptions.length === 0) {
      throw new Error("At least one color option is required");
    }

    const seenColorNames = new Set<string>();
    let colorlessSeen = false;

    const normalizedColorOptions = props.colorOptions.map((color) => {
      const colorName = color.colorName?.trim() || undefined;

      if (!colorName) {
        if (colorlessSeen) {
          throw new Error("Only one color option may be left unnamed");
        }
        colorlessSeen = true;
      } else {
        const key = colorName.toLowerCase();
        if (seenColorNames.has(key)) {
          throw new Error(`Duplicate color name: ${colorName}`);
        }
        seenColorNames.add(key);
      }

      if (!color.variants || color.variants.length === 0) {
        throw new Error("Each color option must have at least one variant");
      }

      const seenSizes = new Set<string>();
      let sizelessSeen = false;

      const normalizedVariants = color.variants.map((variant) => {
        const size = variant.size?.trim() || undefined;

        if (!size) {
          if (sizelessSeen) {
            throw new Error("Only one variant per color may be left without a size");
          }
          sizelessSeen = true;
        } else {
          const key = size.toLowerCase();
          if (seenSizes.has(key)) {
            throw new Error(`Duplicate variant size: ${size}`);
          }
          seenSizes.add(key);
        }

        if (variant.stock < 0) {
          throw new Error("Variant stock cannot be negative");
        }

        if (variant.price < 0) {
          throw new Error("Variant price cannot be negative");
        }

        return { ...variant, size, isActive: variant.isActive ?? true };
      });

      return { ...color, colorName, variants: normalizedVariants };
    });

    this.id = props.id ?? null;
    this.name = name;
    this.description = props.description.trim();
    this.category = props.category;
    this.colorOptions = normalizedColorOptions;
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

  updateDetails(props: {
    name: string;
    description: string;
    categoryId: string;
    isFeatured: boolean;
  }): Product {
    const name = props.name.trim();
    const description = props.description.trim();

    if (!name) {
      throw new Error("Product name cannot be empty");
    }

    if (name.length < 2 || name.length > 150) {
      throw new Error("Product name must be between 2 and 150 characters");
    }

    if (description.length < 10 || description.length > 1000) {
      throw new Error(
        "Product description must be between 10 and 1000 characters",
      );
    }

    if (!props.categoryId) {
      throw new Error("Product category is required");
    }

    return new Product({
      ...this,
      name,
      description,
      category: props.categoryId,
      isFeatured: props.isFeatured,
    });
  }
}
