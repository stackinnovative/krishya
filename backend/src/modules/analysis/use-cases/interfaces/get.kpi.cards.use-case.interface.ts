import type { DashboardKpiCardType } from "../../types/analysis.type.js";


export interface IGetKpiCardsUseCase {
    execute(): Promise<DashboardKpiCardType[]>;
}