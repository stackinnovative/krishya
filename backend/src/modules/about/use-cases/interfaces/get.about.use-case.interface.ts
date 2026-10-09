import type { AboutView } from "../../types/about.type.js";

export interface IGetAboutUseCase {
    execute(): Promise<AboutView>;
}
