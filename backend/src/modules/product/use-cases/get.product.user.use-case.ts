import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import type { IGetProductForUserUseCase } from "./interfaces/get.product.user.use-case.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { UserProductView } from "../types/product.type.js";

@injectable()
export class GetProductForUserUseCase
  implements IGetProductForUserUseCase
{
  constructor(
    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository
  ) {}

  async execute(id: string): Promise<UserProductView> {
    const product =
      await this._productRepository.findProductForUser(id);

    if (!product) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    return product;
  }
}
