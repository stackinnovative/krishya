import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { IUnblockProductUseCase } from "./interfaces/unblock.product.use-case.interface.js";

@injectable()
export class UnblockProductUseCase implements IUnblockProductUseCase {
  constructor(
    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository
  ) {}

  async execute(id: string): Promise<void> {
    const product = await this._productRepository.findById(id);

    if (!product) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    if (product.isActive) {
      throw new CustomError(
        ResponseMessages.PRODUCT_ALREADY_ACTIVE,
        HttpStatusCode.BAD_REQUEST
      );
    }

    const activated = product.activate();
    await this._productRepository.save(activated);
  }
}
