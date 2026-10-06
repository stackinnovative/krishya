import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import type { IProductRepository } from "../repositories/product.repository.interface.js";
import type { IBlockProductUseCase } from "./interfaces/block.product.use-case.interface.js";

@injectable()
export class BlockProductUseCase implements IBlockProductUseCase {
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

    if (!product.isActive) {
      throw new CustomError(
        ResponseMessages.PRODUCT_ALREADY_INACTIVE,
        HttpStatusCode.BAD_REQUEST
      );
    }

    const deactivated = product.deactivate();
    await this._productRepository.save(deactivated);
  }
}
