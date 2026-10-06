import type { UserProductListView } from "../../types/product.type.js";

export interface IGetRelatedProductUseCase {
    execute(categoryId: string, excludeProductId?: string): Promise<UserProductListView[]>
}