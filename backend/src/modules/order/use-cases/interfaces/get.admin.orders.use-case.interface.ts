import type { GetAllQueryDto } from "../../../../core/shared/dtos/get.all.doc.dto.js";
import type { AdminOrderListItem } from "../../types/order.type.js";


export interface IGetAdminOrdersUseCase {
    execute(dto: GetAllQueryDto): Promise<{ data: AdminOrderListItem[]; total: number }>;
}