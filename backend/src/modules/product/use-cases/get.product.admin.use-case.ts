import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import type { IGetProductDetailsForAdminUseCase } from "./interfaces/get.product.admin.use-case.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { ProductView } from "../types/product.type.js";

@injectable()
export class GetProductDetailsForAdminUseCase
  implements IGetProductDetailsForAdminUseCase {
  constructor(
    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository
  ) { }

  async execute(id: string): Promise<ProductView> {
    const product =
      await this._productRepository.findProductForAdmin(id);

    if (!product) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    return product;
  }
}
