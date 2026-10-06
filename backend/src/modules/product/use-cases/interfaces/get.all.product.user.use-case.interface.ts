import type { GetAllQueryDto } from "../../../../core/shared/dtos/get.all.doc.dto.js";
import type { PaginatedUserProductList } from "../../types/product.type.js";

export interface IGetAllProductForUserUseCase {
    execute(dto: GetAllQueryDto): Promise<PaginatedUserProductList>;
}