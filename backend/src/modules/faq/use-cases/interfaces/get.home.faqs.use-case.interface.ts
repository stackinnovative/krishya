import type { UserFaqView } from "../../types/faq.type.js";

export interface IGetHomeFaqsUseCase {
    execute(): Promise<UserFaqView[]>;
}
