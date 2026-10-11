import type { UserFaqGroupView } from "../../types/faq.type.js";

export interface IGetFaqsUserUseCase {
    execute(): Promise<UserFaqGroupView[]>;
}
