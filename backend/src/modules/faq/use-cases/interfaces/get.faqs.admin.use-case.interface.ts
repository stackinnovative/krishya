import type { AdminFaqGroupView } from "../../types/faq.type.js";

export interface IGetFaqsAdminUseCase {
    execute(): Promise<AdminFaqGroupView[]>;
}
