import { Product } from "../entities/product.entity.js";
import type { AdminVariantView, ProductListView, ProductView, UserProductListView, UserProductView } from "../types/product.type.js";

/** First color's first photo - the representative image for list/card views now that there's no separate cardImage. */
const firstImageUrl = (colorOptions: any[] | undefined): string =>
  colorOptions?.[0]?.images?.[0]?.url ?? "";

export class ProductMapper {
  static toDomain(productModelData: any): Product | null {
    if (!productModelData) {
      return null;
    }

    const idString =
      productModelData._id?.toString() || productModelData.id?.toString();

    if (!idString) {
      console.error("Product data from DB is missing an ID:", productModelData);
      return null;
    }

    return new Product({
      id: idString,
      name: productModelData.name,
      description: productModelData.description,
      category:
        productModelData.category?.toString() ||
        productModelData.category ||
        null,
      colorOptions:
        productModelData.colorOptions?.map((color: any) => ({
          id: color._id?.toString() || color.id?.toString(),
          colorName: color.colorName,
          hex: color.hex,
          images: color.images,
          variants:
            color.variants?.map((variant: any) => ({
              id: variant._id?.toString() || variant.id?.toString(),
              size: variant.size,
              stock: variant.stock,
              price: variant.price,
              isActive: variant.isActive,
            })) ?? [],
        })) ?? [],
      isActive: productModelData.isActive,
      isFeatured: productModelData.isFeatured,
    });
  }

  static toPersistence(productEntity: Product): any {
    return {
      name: productEntity.name,
      description: productEntity.description,
      category: productEntity.category,
      colorOptions: productEntity.colorOptions.map((color) => ({
        _id: color.id,
        colorName: color.colorName,
        hex: color.hex,
        images: color.images,
        variants: color.variants.map((variant) => ({
          _id: variant.id,
          size: variant.size,
          stock: variant.stock,
          price: variant.price,
          isActive: variant.isActive,
        })),
      })),
      isActive: productEntity.isActive,
      isFeatured: productEntity.isFeatured,
    };
  }

  static toAdminView(productModelData: any): ProductView | null {
    if (!productModelData) return null;

    const id =
      productModelData._id?.toString() || productModelData.id?.toString();

    if (!id) {
      console.error("Product data missing ID:", productModelData);
      return null;
    }

    const category = productModelData.category;

    if (!category || !category._id || !category.name) {
      console.error(
        "Product category not populated correctly:",
        productModelData,
      );
      return null;
    }

    return {
      id,
      name: productModelData.name,
      description: productModelData.description,
      category: {
        id: category._id.toString(),
        name: category.name,
      },
      variants: (productModelData.colorOptions ?? []).flatMap((color: any) =>
        (color.variants ?? []).map((variant: any) => ({
          id: variant._id.toString(),
          size: variant.size,
          stock: variant.stock,
          price: variant.price,
          isActive: variant.isActive,
          isDefault: variant._id.toString() === productModelData.defaultVariantId?.toString(),
          colorOptionId: color._id?.toString(),
          colorName: color.colorName,
        })),
      ),
      colorOptions: (productModelData.colorOptions ?? []).map((color: any) => ({
        id: color._id.toString(),
        colorName: color.colorName,
        hex: color.hex,
        images: (color.images ?? []).map((item: any) => ({
          publicId: item.publicId,
          url: item.url,
        })),
      })),
      isActive: productModelData.isActive,
      isFeatured: productModelData.isFeatured,
    };
  }

  static toAdminListView(productModelData: any): ProductListView | null {
    if (!productModelData) return null;

    const id =
      productModelData._id?.toString() || productModelData.id?.toString();

    if (!id) {
      console.error("Product data missing ID:", productModelData);
      return null;
    }

    const category = productModelData.category;

    if (!category || !category._id || !category.name) {
      console.error(
        "Product category not populated correctly:",
        productModelData,
      );
      return null;
    }

    return {
      id,
      name: productModelData.name,
      description: productModelData.description,
      price: productModelData.defaultPrice ?? 0,
      image: firstImageUrl(productModelData.colorOptions) || undefined,
      category: {
        id: category._id.toString(),
        name: category.name,
      },
      isActive: productModelData.isActive,
      isFeatured: productModelData.isFeatured,
    };
  }

  /* ================= USER DETAIL VIEW ================= */
  static toUserView(productModelData: any): UserProductView | null {
    if (!productModelData) return null;

    const id =
      productModelData._id?.toString() || productModelData.id?.toString();

    if (!id) {
      console.error("Product data missing ID:", productModelData);
      return null;
    }

    return {
      id,
      name: productModelData.name,
      description: productModelData.description,
      categoryId:
        productModelData.category?.toString() ||
        productModelData.category ||
        "",
      variants: (productModelData.colorOptions ?? []).flatMap((color: any) =>
        (color.variants ?? [])
          .filter((variant: any) => variant.isActive !== false)
          .map((variant: any) => ({
            variantId: variant._id.toString(),
            size: variant.size,
            price: variant.price,
            stock: variant.stock,
            colorOptionId: color._id?.toString(),
            colorName: color.colorName,
          })),
      ),
      colorOptions: (productModelData.colorOptions ?? [])
        .filter((color: any) =>
          (color.variants ?? []).some((variant: any) => variant.isActive !== false),
        )
        .map((color: any) => ({
          id: color._id.toString(),
          colorName: color.colorName,
          hex: color.hex,
          images: (color.images ?? []).map((item: any) => ({
            url: item.url,
          })),
        })),
    };
  }

  /* ================= USER LIST VIEW (INFINITE SCROLL) ================= */
  static toUserListView(
    productModelData: any,
  ): UserProductListView | null {
    if (!productModelData) return null;

    const id =
      productModelData._id?.toString() || productModelData.id?.toString();

    if (!id) {
      console.error("Product data missing ID:", productModelData);
      return null;
    }

    return {
      id,
      name: productModelData.name,
      price: productModelData.defaultPrice ?? 0,
      image: firstImageUrl(productModelData.colorOptions),
    };
  }

  static toVariantView(varinatData: any): AdminVariantView | null {
    if (!varinatData) return null;

    const id =
      varinatData._id?.toString() || varinatData.id?.toString();

    if (!id) {
      console.error("Product data missing ID:", varinatData);
      return null;
    }

    return {
      variantId: id,
      size: varinatData.size,
      stock: varinatData.stock,
      price: varinatData.price,
      isActive: varinatData.isActive,
      isDefault: id === varinatData.defaultVariantId?.toString?.(),
      colorOptionId: varinatData.colorOptionId?.toString?.() ?? varinatData.colorOptionId,
      colorName: varinatData.colorName,
    };
  }
}
