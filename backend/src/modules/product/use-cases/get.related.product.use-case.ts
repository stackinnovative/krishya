import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { UserProductListView } from "../types/product.type.js";
import type { IGetRelatedProductUseCase } from "./interfaces/get.related.product.use-case.interface.js";

@injectable()
export class GetRelatedProductUseCase implements IGetRelatedProductUseCase {
    constructor(
        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository,
    ) { }

    async execute(categoryId: string, excludeProductId?: string): Promise<UserProductListView[]> {
        return this._productRepository.findRelatedProducts(categoryId, excludeProductId);
    }
}