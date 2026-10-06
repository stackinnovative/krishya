import { inject, injectable } from "tsyringe";
import type { IGetAllProductForUserUseCase } from "./interfaces/get.all.product.user.use-case.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js";

import type {
  PaginatedUserProductList,
} from "../types/product.type.js";
import type { GetAllQueryDto } from "../../../core/shared/dtos/get.all.doc.dto.js";

@injectable()
export class GetAllProductForUserUseCase implements IGetAllProductForUserUseCase {
  constructor(
    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository,
  ) {}

  async execute(dto: GetAllQueryDto): Promise<PaginatedUserProductList> {
    const { search, limit, sortValue, filters,  page } = dto;

    const query: Record<string, any> = {
      isActive: true,
    };

    let sort: Record<string, any> = { _id: -1 };

    /* ---------- category filter ---------- */
    if (filters.categoryId) {
      query.category = filters.categoryId;
    }

    /* ---------- sorting ---------- */
    if (sortValue === "oldest") {
      sort = { _id: 1 };
    } else if (sortValue === "newest") {
      sort = { _id: -1 };
    } else if (sortValue === "price_low_high") {
      sort = { defaultPrice: 1, _id: -1 };
    } else if (sortValue === "price_high_low") {
      sort = { defaultPrice: -1, _id: -1 };
    }

    /* ---------- search ---------- */
    if (search && search.trim() !== "") {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    return this._productRepository.findAllForUser({
      query,
      limit,
      sort,
      page,
    });
  }
}
