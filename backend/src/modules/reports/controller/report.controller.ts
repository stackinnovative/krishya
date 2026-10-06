// src/modules/report/report.controller.ts
import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { IRevenueReportUseCase } from "../use-cases/interfaces/get.revenue.report.use-case.interface.js";
import { RevenueReportQuerySchema } from "../dto/request.revenue.data.dto.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { handleError } from "../../../core/errors/custom.error.js";
import type { IReportController } from "./report.controller.interface.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

@injectable()
export class ReportController implements IReportController {
  constructor(
    @inject("IRevenueReportUseCase")
    private _reportUseCase: IRevenueReportUseCase
  ) { }

  async getRevenueReport(req: Request, res: Response): Promise<void> {
    try {
      const parsedQuery = RevenueReportQuerySchema.parse(req.query);
      const reportData = await this._reportUseCase.execute(parsedQuery);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.REVENUE_REPORT_FETCHED_SUCCESSFULLY,
        data: {
          summary: reportData.summary,
          dailyData: reportData.dailyData,
          granularity: reportData.granularity,
        },
        totalPages: reportData.totalPages,
        total: reportData.total,
        currentPage: parsedQuery.page,
      });

    } catch (error: any) {
      handleError(res, error)
    }
  };
}