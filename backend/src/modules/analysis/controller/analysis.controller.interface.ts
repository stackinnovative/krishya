import type { Request, Response } from "express";

export interface IAnalysisController {
    getRevenueChart(req: Request, res: Response): Promise<void>;
    getKpiCards(req: Request, res: Response): Promise<void>
    getProductRankings(req: Request, res: Response): Promise<void>
    getCategoryRankings(req: Request, res: Response): Promise<void>
    getMotivationSummary(req: Request, res: Response): Promise<void>
    getOrderStatusDistribution(req: Request, res: Response): Promise<void>
}