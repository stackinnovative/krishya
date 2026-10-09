import { container } from "tsyringe";
import type { IAboutRepository } from "../modules/about/repositories/about.repository.interface.js";
import { AboutRepository } from "../modules/about/repositories/about.repository.js";
import type { IGetAboutUseCase } from "../modules/about/use-cases/interfaces/get.about.use-case.interface.js";
import { GetAboutUseCase } from "../modules/about/use-cases/get.about.use-case.js";
import type { IUpdateAboutUseCase } from "../modules/about/use-cases/interfaces/update.about.use-case.interface.js";
import { UpdateAboutUseCase } from "../modules/about/use-cases/update.about.use-case.js";

export const registerAboutDependencies = () => {
    container.register<IAboutRepository>("IAboutRepository", {
        useClass: AboutRepository,
    });
    container.register<IGetAboutUseCase>("IGetAboutUseCase", {
        useClass: GetAboutUseCase,
    });
    container.register<IUpdateAboutUseCase>("IUpdateAboutUseCase", {
        useClass: UpdateAboutUseCase,
    });
};
