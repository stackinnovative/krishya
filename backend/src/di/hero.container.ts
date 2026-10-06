import { container } from "tsyringe";
import type { ICreateHeroUseCase } from "../modules/hero/use-cases/interfaces/create.hero.use-case.interface.js";
import { CreateHeroUseCase } from "../modules/hero/use-cases/create.hero.use-case.js";
import type { IEditHeroUseCase } from "../modules/hero/use-cases/interfaces/edit.hero.use-case.interface.js";
import { EditHeroUseCase } from "../modules/hero/use-cases/edit.hero.use-case.js";
import type { IBlockHeroUseCase } from "../modules/hero/use-cases/interfaces/block.hero.use-case.interface.js";
import { BlockHeroUseCase } from "../modules/hero/use-cases/block.hero.use-case.js";
import type { IUnblockHeroUseCase } from "../modules/hero/use-cases/interfaces/unblock.hero.use-case.interface.js";
import { UnblockHeroUseCase } from "../modules/hero/use-cases/unblock.hero.use-case.js";
import type { IGetHeroUserUseCase } from "../modules/hero/use-cases/interfaces/get.hero.user.use-case.interface.js";
import { GetHeroUserUseCase } from "../modules/hero/use-cases/get.hero.user.use-case.js";
import type { IGetHeroAdminUseCase } from "../modules/hero/use-cases/interfaces/get.hero.admin.use-case.interface.js";
import { GetHeroAdminUseCase } from "../modules/hero/use-cases/get.hero.admin.use-case.js";
import type { IHeroRepository } from "../modules/hero/repositories/hero.repository.interface.js";
import { HeroRepository } from "../modules/hero/repositories/hero.repository.js";
import type { IGetHeroByIdUseCase } from "../modules/hero/use-cases/interfaces/get.hero.by.id.use-case.interface.js";
import { GetHeroByIdUseCase } from "../modules/hero/use-cases/get.hero.by.id.use-case.js";


export const registerHeroDependencies = () => {
    container.register<IHeroRepository>("IHeroRepository", {
        useClass: HeroRepository,
    });
    container.register<ICreateHeroUseCase>("ICreateHeroUseCase", {
        useClass: CreateHeroUseCase,
    });
    container.register<IEditHeroUseCase>("IEditHeroUseCase", {
        useClass: EditHeroUseCase,
    });
    container.register<IBlockHeroUseCase>("IBlockHeroUseCase", {
        useClass: BlockHeroUseCase,
    });
    container.register<IUnblockHeroUseCase>("IUnblockHeroUseCase", {
        useClass: UnblockHeroUseCase,
    });
    container.register<IGetHeroUserUseCase>("IGetHeroUserUseCase", {
        useClass: GetHeroUserUseCase,
    });
    container.register<IGetHeroAdminUseCase>("IGetHeroAdminUseCase", {
        useClass: GetHeroAdminUseCase,
    });

    container.register<IGetHeroByIdUseCase>("IGetHeroByIdUseCase", {
        useClass: GetHeroByIdUseCase,
    });
}