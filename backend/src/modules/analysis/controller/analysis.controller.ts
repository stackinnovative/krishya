import { inject, injectable } from "tsyringe";
import {
  GetRevenueQuerySchema,
  type GetRevenueQueryDto,
} from "../dto/get.revenue.dto.js";
import type { IAnalysisController } from "./analysis.controller.interface.js";
import type { Request, Response } from "express";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";
import type { IGetRevenueChartUseCase } from "../use-cases/interfaces/get.revenue.use-case.interface.js";
import type { IGetKpiCardsUseCase } from "../use-cases/interfaces/get.kpi.cards.use-case.interface.js";
import type { IGetProductRankingsUseCase } from "../use-cases/interfaces/get.product.rankings.use-case.interface.js";
import type { IGetCategoryRankingsUseCase } from "../use-cases/interfaces/get.category.rankings.use-case.interface.js";
import type { IGetMotivationUseCase } from "../use-cases/interfaces/get.motivation.use-case.interface.js";
import type { IGetOrderStatusDistributionUseCase } from "../use-cases/interfaces/get.order.status.use-case.interface.js";

@injectable()
export class AnalysisController implements IAnalysisController {
  constructor(
    @inject("IGetRevenueChartUseCase")
    private _getRevenueChartUseCase: IGetRevenueChartUseCase,
    @inject("IGetKpiCardsUseCase")
    private readonly _getKpiCardsUseCase: IGetKpiCardsUseCase,

    @inject("IGetProductRankingsUseCase")
    private readonly _getProductRankingsUseCase: IGetProductRankingsUseCase,

    @inject("IGetCategoryRankingsUseCase")
    private readonly _getCategoryRankingsUseCase: IGetCategoryRankingsUseCase,

    @inject("IGetMotivationUseCase")
    private readonly _getMotivationUseCase: IGetMotivationUseCase,

    @inject("IGetOrderStatusDistributionUseCase")
    private readonly _getOrderStatusDistributionUseCase: IGetOrderStatusDistributionUseCase
  ) { }

  async getRevenueChart(req: Request, res: Response): Promise<void> {
    try {

      const dto: GetRevenueQueryDto = GetRevenueQuerySchema.parse({
        range: req.query.range ?? "Month",
      });

      const data = await this._getRevenueChartUseCase.execute(dto);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: data,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get revenue chart controller ", error);
    }
  }

  async getKpiCards(req: Request, res: Response): Promise<void> {
    try {
      const data = await this._getKpiCardsUseCase.execute();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: data,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get kpi cards controller ", error);
    }
  }

  async getProductRankings(req: Request, res: Response): Promise<void> {
    try {
      const data = await this._getProductRankingsUseCase.execute();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: data, // Returns { topSelling, lowSelling }
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get product rankings controller ", error);
    }
  }
  async getCategoryRankings(req: Request, res: Response): Promise<void> {
    try {
      const data = await this._getCategoryRankingsUseCase.execute();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: data,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get category rankings controller ", error);
    }
  }

  async getMotivationSummary(req: Request, res: Response): Promise<void> {
    try {
      const data = await this._getMotivationUseCase.execute();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: data,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get motivation summary controller ", error);
    }
  }

  async getOrderStatusDistribution(req: Request, res: Response): Promise<void> {
    try {
      const data = await this._getOrderStatusDistributionUseCase.execute();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: data,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get order status distribution controller ", error);
    }
  }
}
