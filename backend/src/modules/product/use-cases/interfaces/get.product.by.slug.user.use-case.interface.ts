import type { UserProductView } from "../../types/product.type.js";

export interface IGetProductBySlugForUserUseCase {
  execute(slug: string): Promise<UserProductView>;
}
