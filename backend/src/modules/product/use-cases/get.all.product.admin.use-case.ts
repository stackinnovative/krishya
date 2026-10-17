import { inject, injectable } from "tsyringe";
import type { IGetAllProductForAdminUseCase } from "./interfaces/get.all.product.admin.use-case.interface.js";
import type { GetAllQueryDto } from "../../../core/shared/dtos/get.all.doc.dto.js";
import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";
import type { IProductRepository } from "../repositories/product.repository.interface.js";
import { PRODUCT_TYPES, type ProductListView } from "../types/product.type.js";

@injectable()
export class GetAllProductForAdminUseCase implements IGetAllProductForAdminUseCase {
  constructor(
    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository,
  ) { }

  async execute(
    dto: GetAllQueryDto,
  ): Promise<{ data: ProductListView[]; total: number }> {
    const { page, search, limit, sortValue, filters } = dto;

    const query: Record<string, any> = {};
    let sort: Record<string, any> = { createdAt: -1 };

    /* ---------- sorting ---------- */
    if (sortValue === "oldest") {
      sort = { createdAt: 1 };
    } else if (sortValue === "newest") {
      sort = { createdAt: -1 };
    } else if (sortValue === "price_low_high") {
      sort = { defaultPrice: 1 };
    } else if (sortValue === "price_high_low") {
      sort = { defaultPrice: -1 };
    }

    /* ---------- search (name + description) ---------- */
    if (search && search.trim() !== "") {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    /* ---------- filters ---------- */
    if (filters) {
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      if (filters.categoryId) {
        query.category = filters.categoryId;
      }

      if (filters.isFeatured !== undefined) {
        query.isFeatured = filters.isFeatured;
      }

      if (PRODUCT_TYPES.includes(filters.type)) {
        query.type = filters.type;
      }
    }

    const allDoc: IGetAllDocDB = {
      page,
      limit,
      query,
      sort,
    };

    const [data, total] = await Promise.all([
      this._productRepository.findAllForAdmin(allDoc),
      this._productRepository.countDocument(query),
    ]);

    return { data, total };
  }
}
