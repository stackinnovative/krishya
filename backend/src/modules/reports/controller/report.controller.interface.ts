import type { Request, Response } from "express";

export interface IReportController {
    getRevenueReport(req: Request, res: Response): Promise<void>
}
