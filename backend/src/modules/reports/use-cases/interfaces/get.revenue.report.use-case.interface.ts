import type { RevenueReportQueryDto } from "../../dto/request.revenue.data.dto.js";
import type { RevenueReportSummary } from "../../types/report.type.js";

export interface IRevenueReportUseCase {
    execute(query: RevenueReportQueryDto): Promise<RevenueReportSummary>
}