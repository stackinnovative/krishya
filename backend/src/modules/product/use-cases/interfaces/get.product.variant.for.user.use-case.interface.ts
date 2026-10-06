import type { UserVariantView } from "../../types/product.type.js";

export interface IGetProductVariantForUserUseCase {
    execute(productId: string, variantId: string): Promise<UserVariantView>;
}