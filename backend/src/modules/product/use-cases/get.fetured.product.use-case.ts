import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { UserProductListView } from "../types/product.type.js";
import type { IGetFeaturedProductUseCase } from "./interfaces/get.fetured.product.use-case.interface.js";
import { inject, injectable } from "tsyringe";


@injectable()
export class GetFeaturedProductUseCase implements IGetFeaturedProductUseCase {
    constructor(
        @inject("IProductRepository")
        private readonly productRepository: IProductRepository,
    ) { }

    async execute(): Promise<UserProductListView[]> {
        return this.productRepository.findFeaturedProducts();
    }
}