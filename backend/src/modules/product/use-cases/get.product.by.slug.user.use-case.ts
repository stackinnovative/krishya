import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import type { IGetProductBySlugForUserUseCase } from "./interfaces/get.product.by.slug.user.use-case.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { UserProductView } from "../types/product.type.js";

/** The storefront product page, looked up by its /products/<slug> link. */
@injectable()
export class GetProductBySlugForUserUseCase implements IGetProductBySlugForUserUseCase {
  constructor(
    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository
  ) {}

  async execute(slug: string): Promise<UserProductView> {
    const product = await this._productRepository.findProductForUserBySlug(slug);

    if (!product) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    return product;
  }
}
