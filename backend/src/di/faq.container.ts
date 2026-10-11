import { container } from "tsyringe";
import type { IFaqRepository } from "../modules/faq/repositories/faq.repository.interface.js";
import { FaqRepository } from "../modules/faq/repositories/faq.repository.js";
import type { IGetFaqsAdminUseCase } from "../modules/faq/use-cases/interfaces/get.faqs.admin.use-case.interface.js";
import { GetFaqsAdminUseCase } from "../modules/faq/use-cases/get.faqs.admin.use-case.js";
import type { IGetFaqsUserUseCase } from "../modules/faq/use-cases/interfaces/get.faqs.user.use-case.interface.js";
import { GetFaqsUserUseCase } from "../modules/faq/use-cases/get.faqs.user.use-case.js";
import type { IGetHomeFaqsUseCase } from "../modules/faq/use-cases/interfaces/get.home.faqs.use-case.interface.js";
import { GetHomeFaqsUseCase } from "../modules/faq/use-cases/get.home.faqs.use-case.js";
import type { ICreateFaqGroupUseCase } from "../modules/faq/use-cases/interfaces/create.faq.group.use-case.interface.js";
import { CreateFaqGroupUseCase } from "../modules/faq/use-cases/create.faq.group.use-case.js";
import type { IEditFaqGroupUseCase } from "../modules/faq/use-cases/interfaces/edit.faq.group.use-case.interface.js";
import { EditFaqGroupUseCase } from "../modules/faq/use-cases/edit.faq.group.use-case.js";
import type { IDeleteFaqGroupUseCase } from "../modules/faq/use-cases/interfaces/delete.faq.group.use-case.interface.js";
import { DeleteFaqGroupUseCase } from "../modules/faq/use-cases/delete.faq.group.use-case.js";
import type { IReorderFaqGroupsUseCase } from "../modules/faq/use-cases/interfaces/reorder.faq.groups.use-case.interface.js";
import { ReorderFaqGroupsUseCase } from "../modules/faq/use-cases/reorder.faq.groups.use-case.js";
import type { ICreateFaqUseCase } from "../modules/faq/use-cases/interfaces/create.faq.use-case.interface.js";
import { CreateFaqUseCase } from "../modules/faq/use-cases/create.faq.use-case.js";
import type { IEditFaqUseCase } from "../modules/faq/use-cases/interfaces/edit.faq.use-case.interface.js";
import { EditFaqUseCase } from "../modules/faq/use-cases/edit.faq.use-case.js";
import type { IDeleteFaqUseCase } from "../modules/faq/use-cases/interfaces/delete.faq.use-case.interface.js";
import { DeleteFaqUseCase } from "../modules/faq/use-cases/delete.faq.use-case.js";
import type { IReorderFaqsUseCase } from "../modules/faq/use-cases/interfaces/reorder.faqs.use-case.interface.js";
import { ReorderFaqsUseCase } from "../modules/faq/use-cases/reorder.faqs.use-case.js";

export const registerFaqDependencies = () => {
    container.register<IFaqRepository>("IFaqRepository", {
        useClass: FaqRepository,
    });
    container.register<IGetFaqsAdminUseCase>("IGetFaqsAdminUseCase", {
        useClass: GetFaqsAdminUseCase,
    });
    container.register<IGetFaqsUserUseCase>("IGetFaqsUserUseCase", {
        useClass: GetFaqsUserUseCase,
    });
    container.register<IGetHomeFaqsUseCase>("IGetHomeFaqsUseCase", {
        useClass: GetHomeFaqsUseCase,
    });
    container.register<ICreateFaqGroupUseCase>("ICreateFaqGroupUseCase", {
        useClass: CreateFaqGroupUseCase,
    });
    container.register<IEditFaqGroupUseCase>("IEditFaqGroupUseCase", {
        useClass: EditFaqGroupUseCase,
    });
    container.register<IDeleteFaqGroupUseCase>("IDeleteFaqGroupUseCase", {
        useClass: DeleteFaqGroupUseCase,
    });
    container.register<IReorderFaqGroupsUseCase>("IReorderFaqGroupsUseCase", {
        useClass: ReorderFaqGroupsUseCase,
    });
    container.register<ICreateFaqUseCase>("ICreateFaqUseCase", {
        useClass: CreateFaqUseCase,
    });
    container.register<IEditFaqUseCase>("IEditFaqUseCase", {
        useClass: EditFaqUseCase,
    });
    container.register<IDeleteFaqUseCase>("IDeleteFaqUseCase", {
        useClass: DeleteFaqUseCase,
    });
    container.register<IReorderFaqsUseCase>("IReorderFaqsUseCase", {
        useClass: ReorderFaqsUseCase,
    });
};
