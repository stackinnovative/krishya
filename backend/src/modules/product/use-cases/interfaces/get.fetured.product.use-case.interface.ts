import type { UserProductListView } from "../../types/product.type.js";

export interface IGetFeaturedProductUseCase {
    execute(): Promise<UserProductListView[]>;
}