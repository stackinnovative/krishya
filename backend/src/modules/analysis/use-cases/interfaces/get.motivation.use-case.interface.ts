import type { DashboardMotivationSummary } from "../../types/analysis.type.js";

export interface IGetMotivationUseCase {
    execute(): Promise<DashboardMotivationSummary>;
}