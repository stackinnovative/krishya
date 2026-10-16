import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";
import { Product } from "../entities/product.entity.js";
import type {
  AddVariantProps,
  AdminVariantView,
  PaginatedUserProductList,
  ProductListView,
  ProductView,
  UpdateVariantParams,
  UserProductListView,
  UserProductView,
  StockUpdateProps
} from "../types/product.type.js";
import type { ClientSession } from "mongoose";

export interface IProductRepository {
  create(productEntity: Product, defaultVariantIndex: number): Promise<Product>;
  findById(id: string, session?: ClientSession): Promise<Product | null>;
  isSlugTaken(slug: string): Promise<boolean>;
  /** Writes everything except the slug and variants. */
  save(productEntity: Product): Promise<Product>;
  findAllForAdmin(allDoc: IGetAllDocDB): Promise<ProductListView[]>;
  countDocument(query: Record<string, unknown>): Promise<number>;
  findProductForAdmin(id: string): Promise<ProductView | null>;
  findProductForUser(id: string): Promise<UserProductView | null>;
  findFeaturedProducts(): Promise<UserProductListView[]>;
  findProductVariant(productId: string, variantId: string, isActive?: boolean): Promise<AdminVariantView | null>;
  addVariants(productId: string, variants: AddVariantProps[]): Promise<Product | null>;
  updateVariantById(params: UpdateVariantParams): Promise<Product | null>;
  findAllForUser(allDoc: IGetAllDocDB): Promise<PaginatedUserProductList>;
  findRelatedProducts(categoryId: string, excludeProductId?: string): Promise<UserProductListView[]>;
  findByCategoryIds(categoryIds: string[], limit: number): Promise<UserProductListView[]>;
  findByIds(ids: string[]): Promise<UserProductListView[]>;
  decrementStock(params: StockUpdateProps): Promise<void>;
  incrementStock(params: StockUpdateProps): Promise<void>;
}
