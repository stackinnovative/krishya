import { container } from "tsyringe";
import type { IRevenueReportUseCase } from "../modules/reports/use-cases/interfaces/get.revenue.report.use-case.interface.js";
import { RevenueReportUseCase } from "../modules/reports/use-cases/get.revenue.report.use-case.js";

 
export const registerReportDependencies = () => {
     container.register<IRevenueReportUseCase>("IRevenueReportUseCase", {
        useClass: RevenueReportUseCase,
    });
}