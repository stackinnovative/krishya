import { container } from "tsyringe";
import type { IBannerRepository } from "../modules/banner/repositories/banner.repository.interface.js";
import { BannerRepository } from "../modules/banner/repositories/banner.repository.js";
import type { ICreateBannerUseCase } from "../modules/banner/use-cases/interfaces/create.banner.use-case.interface.js";
import { CreateBannerUseCase } from "../modules/banner/use-cases/create.banner.use-case.js";
import type { IEditBannerUseCase } from "../modules/banner/use-cases/interfaces/edit.banner.use-case.interface.js";
import { EditBannerUseCase } from "../modules/banner/use-cases/edit.banner.use-case.js";
import type { IBlockBannerUseCase } from "../modules/banner/use-cases/interfaces/block.banner.use-case.interface.js";
import { BlockBannerUseCase } from "../modules/banner/use-cases/block.banner.use-case.js";
import type { IUnblockBannerUseCase } from "../modules/banner/use-cases/interfaces/unblock.banner.use-case.interface.js";
import { UnblockBannerUseCase } from "../modules/banner/use-cases/unblock.banner.use-case.js";
import type { IGetBannerUserUseCase } from "../modules/banner/use-cases/interfaces/get.banner.user.use-case.interface.js";
import { GetBannerUserUseCase } from "../modules/banner/use-cases/get.banner.user.use-case.js";
import type { IGetBannerAdminUseCase } from "../modules/banner/use-cases/interfaces/get.banner.admin.use-case.interface.js";
import { GetBannerAdminUseCase } from "../modules/banner/use-cases/get.banner.admin.use-case.js";
import type { IGetBannerByIdUseCase } from "../modules/banner/use-cases/interfaces/get.banner.by.id.use-case.interface.js";
import { GetBannerByIdUseCase } from "../modules/banner/use-cases/get.banner.by.id.use-case.js";
import type { IDeleteBannerUseCase } from "../modules/banner/use-cases/interfaces/delete.banner.use-case.interface.js";
import { DeleteBannerUseCase } from "../modules/banner/use-cases/delete.banner.use-case.js";


export const registerBannerDependencies = () => {
    container.register<IBannerRepository>("IBannerRepository", {
        useClass: BannerRepository,
    });
    container.register<ICreateBannerUseCase>("ICreateBannerUseCase", {
        useClass: CreateBannerUseCase,
    });
    container.register<IEditBannerUseCase>("IEditBannerUseCase", {
        useClass: EditBannerUseCase,
    });
    container.register<IBlockBannerUseCase>("IBlockBannerUseCase", {
        useClass: BlockBannerUseCase,
    });
    container.register<IUnblockBannerUseCase>("IUnblockBannerUseCase", {
        useClass: UnblockBannerUseCase,
    });
    container.register<IGetBannerUserUseCase>("IGetBannerUserUseCase", {
        useClass: GetBannerUserUseCase,
    });
    container.register<IGetBannerAdminUseCase>("IGetBannerAdminUseCase", {
        useClass: GetBannerAdminUseCase,
    });
    container.register<IGetBannerByIdUseCase>("IGetBannerByIdUseCase", {
        useClass: GetBannerByIdUseCase,
    });
    container.register<IDeleteBannerUseCase>("IDeleteBannerUseCase", {
        useClass: DeleteBannerUseCase,
    });
}