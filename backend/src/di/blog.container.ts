import { container } from "tsyringe";
import type { IBlogRepository } from "../modules/blog/repositories/blog.repository.interface.js";
import { BlogRepository } from "../modules/blog/repositories/blog.repository.js";
import type { ICreateBlogUseCase } from "../modules/blog/use-cases/interfaces/create.blog.use-case.interface.js";
import { CreateBlogUseCase } from "../modules/blog/use-cases/create.blog.use-case.js";
import type { IEditBlogUseCase } from "../modules/blog/use-cases/interfaces/edit.blog.use-case.interface.js";
import { EditBlogUseCase } from "../modules/blog/use-cases/edit.blog.use-case.js";
import type { IDeleteBlogUseCase } from "../modules/blog/use-cases/interfaces/delete.blog.use-case.interface.js";
import { DeleteBlogUseCase } from "../modules/blog/use-cases/delete.blog.use-case.js";
import type { IPublishBlogUseCase } from "../modules/blog/use-cases/interfaces/publish.blog.use-case.interface.js";
import { PublishBlogUseCase } from "../modules/blog/use-cases/publish.blog.use-case.js";
import type { IUnpublishBlogUseCase } from "../modules/blog/use-cases/interfaces/unpublish.blog.use-case.interface.js";
import { UnpublishBlogUseCase } from "../modules/blog/use-cases/unpublish.blog.use-case.js";
import type { IGetBlogAdminUseCase } from "../modules/blog/use-cases/interfaces/get.blog.admin.use-case.interface.js";
import { GetBlogAdminUseCase } from "../modules/blog/use-cases/get.blog.admin.use-case.js";
import type { IGetAllBlogAdminUseCase } from "../modules/blog/use-cases/interfaces/get.all.blog.admin.use-case.interface.js";
import { GetAllBlogAdminUseCase } from "../modules/blog/use-cases/get.all.blog.admin.use-case.js";
import type { IGetAllBlogUserUseCase } from "../modules/blog/use-cases/interfaces/get.all.blog.user.use-case.interface.js";
import { GetAllBlogUserUseCase } from "../modules/blog/use-cases/get.all.blog.user.use-case.js";
import type { IGetFeaturedBlogUseCase } from "../modules/blog/use-cases/interfaces/get.featured.blog.use-case.interface.js";
import { GetFeaturedBlogUseCase } from "../modules/blog/use-cases/get.featured.blog.use-case.js";
import type { IGetBlogBySlugUseCase } from "../modules/blog/use-cases/interfaces/get.blog.by.slug.use-case.interface.js";
import { GetBlogBySlugUseCase } from "../modules/blog/use-cases/get.blog.by.slug.use-case.js";

export const registerBlogDependencies = () => {
    container.register<IBlogRepository>("IBlogRepository", {
        useClass: BlogRepository,
    });
    container.register<ICreateBlogUseCase>("ICreateBlogUseCase", {
        useClass: CreateBlogUseCase,
    });
    container.register<IEditBlogUseCase>("IEditBlogUseCase", {
        useClass: EditBlogUseCase,
    });
    container.register<IDeleteBlogUseCase>("IDeleteBlogUseCase", {
        useClass: DeleteBlogUseCase,
    });
    container.register<IPublishBlogUseCase>("IPublishBlogUseCase", {
        useClass: PublishBlogUseCase,
    });
    container.register<IUnpublishBlogUseCase>("IUnpublishBlogUseCase", {
        useClass: UnpublishBlogUseCase,
    });
    container.register<IGetBlogAdminUseCase>("IGetBlogAdminUseCase", {
        useClass: GetBlogAdminUseCase,
    });
    container.register<IGetAllBlogAdminUseCase>("IGetAllBlogAdminUseCase", {
        useClass: GetAllBlogAdminUseCase,
    });
    container.register<IGetAllBlogUserUseCase>("IGetAllBlogUserUseCase", {
        useClass: GetAllBlogUserUseCase,
    });
    container.register<IGetFeaturedBlogUseCase>("IGetFeaturedBlogUseCase", {
        useClass: GetFeaturedBlogUseCase,
    });
    container.register<IGetBlogBySlugUseCase>("IGetBlogBySlugUseCase", {
        useClass: GetBlogBySlugUseCase,
    });
};
