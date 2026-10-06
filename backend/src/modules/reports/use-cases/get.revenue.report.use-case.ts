// src/modules/report/report.usecase.ts
import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../order/repositories/order.repository.interface.js";
import type { RevenueReportQueryDto } from "../dto/request.revenue.data.dto.js";
import type { IRevenueReportUseCase } from "./interfaces/get.revenue.report.use-case.interface.js";
import type { RevenueGranularity, RevenueReportSummary } from "../types/report.type.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Bucket size scales with the range's span so the chart/table stay readable
 * (≤~31 bars) without pagination: short ranges stay day-by-day, "this year"
 * and "all time" roll up to weeks/months instead of showing hundreds of
 * daily rows. A null startDate ("all time") has no fixed span to measure, so
 * it goes straight to the coarsest bucket. */
function pickGranularity(startDate: Date | null, endDate: Date | null): RevenueGranularity {
  if (!startDate) return "month";
  const spanDays = Math.ceil(((endDate ?? new Date()).getTime() - startDate.getTime()) / DAY_MS);
  if (spanDays <= 31) return "day";
  if (spanDays <= 180) return "week";
  return "month";
}

@injectable()
export class RevenueReportUseCase implements IRevenueReportUseCase {
  constructor(
    @inject("IOrderRepository")
    private orderRepository: IOrderRepository,
  ) {}

  async execute(query: RevenueReportQueryDto): Promise<RevenueReportSummary> {
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    // 1. Calculate Date Ranges Based on Option
    switch (query.option) {
      case "daily":{
        const today = new Date();
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      }
        
      case "last_7_days": {
        const today = new Date();
        endDate = new Date();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      }

      case "this_week": {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 is Sunday
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(today.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        break;
      }

      case "this_month": {
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date();
        break;
      }
      case "last_month": {
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0); // day 0 of this month = last day of previous month
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case "last_6_months": {
        const today = new Date();
        startDate = new Date(
          today.getFullYear(),
          today.getMonth() - 5,
          1,
          0,
          0,
          0,
          0,
        );
        endDate = new Date();
        break;
      }
      case "this_year": {
        const today = new Date();
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date();
        break;
      }
      case "custom":
        startDate = new Date(query.customStartDate!);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(query.customEndDate!);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "all_time":
      default:
        break;
    }

    // 2. Bucket size: forced to "day" for the detail drill-down (which pairs
    // it with real pagination), otherwise auto-picked from the range's span.
    const granularity: RevenueGranularity = query.detail ? "day" : pickGranularity(startDate, endDate);

    // 3. Fetch from Repository
    const reportData = await this.orderRepository.getRevenueReport({
      startDate,
      endDate,
      granularity,
      page: query.page,
      limit: query.limit,
    });

    return reportData;
  }
}
