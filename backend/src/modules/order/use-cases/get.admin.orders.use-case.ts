import { inject, injectable } from "tsyringe";
import type { IGetAdminOrdersUseCase } from "./interfaces/get.admin.orders.use-case.interface.js";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { AdminOrderListItem } from "../types/order.type.js";
import type { GetAllQueryDto } from "../../../core/shared/dtos/get.all.doc.dto.js";
import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";

@injectable()
export class GetAdminOrdersUseCase implements IGetAdminOrdersUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository
    ) { }

    async execute(dto: GetAllQueryDto): Promise<{ data: AdminOrderListItem[]; total: number }> {
        const { page, search, limit, sortValue, filters, dateFrom, dateTo } = dto;


        const query: Record<string, any> = {};
        let sort: Record<string, any> = {
            createdAt: -1,
        };

        /* ---------- sorting ---------- */
        if (sortValue && sortValue.trim() !== "") {
            if (sortValue === "oldest") {
                sort = { createdAt: 1 };
            } else if (sortValue === "newest") {
                sort = { createdAt: -1 };
            } else if (sortValue === "price_low_high") {
                sort = { totalAmount: 1 };
            } else if (sortValue === "price_high_low") {
                sort = { totalAmount: -1 };
            }
        }

        /* ---------- search (name + description) ---------- */
        if (search && search.trim() !== "") {
            const escapedSearch = search
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            query.$or = [
                { orderNumber: { $regex: escapedSearch, $options: "i" } },
                { "userSnapshot.name": { $regex: escapedSearch, $options: "i" } },
                { "userSnapshot.email": { $regex: escapedSearch, $options: "i" } },
                { "userSnapshot.phone": { $regex: escapedSearch, $options: "i" } },
                { "items.name": { $regex: escapedSearch, $options: "i" } },
            ];
        }

        ///* ---------- filters ---------- */
        if (filters && Object.keys(filters).length > 0) {
            for (const key in filters) {
                query[key] = filters[key];
            }
        }

        /* ---------- date range (createdAt) ---------- */
        if (dateFrom || dateTo) {
            const createdAt: Record<string, Date> = {};
            if (dateFrom) createdAt.$gte = new Date(dateFrom);
            if (dateTo) {
                // dateTo is a plain calendar date (YYYY-MM-DD) - push it to the
                // end of that day so the range includes everything placed on it.
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                createdAt.$lte = end;
            }
            query.createdAt = createdAt;
        }

        const allDoc: IGetAllDocDB = {
            page,
            limit,
            query,
            sort,
        };

        const documents = await this._orderRepository.getAdminOrderList(allDoc);
        const total = await this._orderRepository.countDocuments(query);

        return { data: documents, total };
    }
}