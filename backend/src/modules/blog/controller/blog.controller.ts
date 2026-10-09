import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { CustomError, handleError } from "../../../core/errors/custom.error.js";
import { validateObjectId } from "../../../core/utils/validate.object.id.helper.js";
import { GetAllQuerySchema } from "../../../core/shared/dtos/get.all.doc.dto.js";
import { parseReq } from "../../../core/utils/parse.query.helper.js";

import type { IBlogController } from "./blog.controller.interface.js";
import type { ICreateBlogUseCase } from "../use-cases/interfaces/create.blog.use-case.interface.js";
import type { IEditBlogUseCase } from "../use-cases/interfaces/edit.blog.use-case.interface.js";
import type { IDeleteBlogUseCase } from "../use-cases/interfaces/delete.blog.use-case.interface.js";
import type { IPublishBlogUseCase } from "../use-cases/interfaces/publish.blog.use-case.interface.js";
import type { IUnpublishBlogUseCase } from "../use-cases/interfaces/unpublish.blog.use-case.interface.js";
import type { IGetBlogAdminUseCase } from "../use-cases/interfaces/get.blog.admin.use-case.interface.js";
import type { IGetAllBlogAdminUseCase } from "../use-cases/interfaces/get.all.blog.admin.use-case.interface.js";
import type { IGetAllBlogUserUseCase } from "../use-cases/interfaces/get.all.blog.user.use-case.interface.js";
import type { IGetFeaturedBlogUseCase } from "../use-cases/interfaces/get.featured.blog.use-case.interface.js";
import type { IGetBlogBySlugUseCase } from "../use-cases/interfaces/get.blog.by.slug.use-case.interface.js";
import { CreateBlogSchema, EditBlogSchema, type CreateBlogRequestDto, type EditBlogRequestDto } from "../dtos/blog.dto.js";
import { BLOG_LIMITS } from "../types/blog.type.js";

@injectable()
export class BlogController implements IBlogController {
    constructor(
        @inject("ICreateBlogUseCase")
        private readonly _createBlogUseCase: ICreateBlogUseCase,

        @inject("IEditBlogUseCase")
        private readonly _editBlogUseCase: IEditBlogUseCase,

        @inject("IDeleteBlogUseCase")
        private readonly _deleteBlogUseCase: IDeleteBlogUseCase,

        @inject("IPublishBlogUseCase")
        private readonly _publishBlogUseCase: IPublishBlogUseCase,

        @inject("IUnpublishBlogUseCase")
        private readonly _unpublishBlogUseCase: IUnpublishBlogUseCase,

        @inject("IGetBlogAdminUseCase")
        private readonly _getBlogAdminUseCase: IGetBlogAdminUseCase,

        @inject("IGetAllBlogAdminUseCase")
        private readonly _getAllBlogAdminUseCase: IGetAllBlogAdminUseCase,

        @inject("IGetAllBlogUserUseCase")
        private readonly _getAllBlogUserUseCase: IGetAllBlogUserUseCase,

        @inject("IGetFeaturedBlogUseCase")
        private readonly _getFeaturedBlogUseCase: IGetFeaturedBlogUseCase,

        @inject("IGetBlogBySlugUseCase")
        private readonly _getBlogBySlugUseCase: IGetBlogBySlugUseCase,
    ) { }

    async createBlog(req: Request, res: Response): Promise<void> {
        try {
            const dto: CreateBlogRequestDto = CreateBlogSchema.parse(req.body);

            const data = await this._createBlogUseCase.execute(dto);

            res.status(HttpStatusCode.CREATED).json({
                success: true,
                message: ResponseMessages.BLOG_CREATED,
                data,
            });
        } catch (error) {
            console.log("Error in createBlog:", error);
            handleError(res, error);
        }
    }

    async editBlog(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            const dto: EditBlogRequestDto = EditBlogSchema.parse(req.body);

            const data = await this._editBlogUseCase.execute(id!, dto);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.BLOG_UPDATED,
                data,
            });
        } catch (error) {
            console.log("Error in editBlog:", error);
            handleError(res, error);
        }
    }

    async deleteBlog(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            await this._deleteBlogUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.BLOG_DELETED_SUCCESSFULLY,
            });
        } catch (error) {
            console.log("Error in deleteBlog:", error);
            handleError(res, error);
        }
    }

    async publishBlog(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            await this._publishBlogUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.BLOG_PUBLISHED,
            });
        } catch (error) {
            console.log("Error in publishBlog:", error);
            handleError(res, error);
        }
    }

    async unpublishBlog(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            await this._unpublishBlogUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.BLOG_UNPUBLISHED,
            });
        } catch (error) {
            console.log("Error in unpublishBlog:", error);
            handleError(res, error);
        }
    }

    async getBlogForAdmin(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            const data = await this._getBlogAdminUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data,
            });
        } catch (error) {
            console.log("Error in getBlogForAdmin:", error);
            handleError(res, error);
        }
    }

    async getAllBlogsForAdmin(req: Request, res: Response): Promise<void> {
        try {
            const dto = GetAllQuerySchema.parse(parseReq(req, ["status", "category"]));

            const { data, total } = await this._getAllBlogAdminUseCase.execute(dto);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data,
                total,
                totalPages: Math.ceil(total / dto.limit),
            });
        } catch (error) {
            console.log("Error in getAllBlogsForAdmin:", error);
            handleError(res, error);
        }
    }

    async getAllBlogsForUser(req: Request, res: Response): Promise<void> {
        try {
            const dto = GetAllQuerySchema.parse(parseReq(req, ["category", "excludeId"]));

            const { data, total } = await this._getAllBlogUserUseCase.execute(dto);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data,
                total,
                totalPages: Math.ceil(total / dto.limit),
            });
        } catch (error) {
            console.log("Error in getAllBlogsForUser:", error);
            handleError(res, error);
        }
    }

    async getFeaturedBlog(req: Request, res: Response): Promise<void> {
        try {
            const data = await this._getFeaturedBlogUseCase.execute();

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data,
            });
        } catch (error) {
            console.log("Error in getFeaturedBlog:", error);
            handleError(res, error);
        }
    }

    async getBlogBySlug(req: Request, res: Response): Promise<void> {
        try {
            const slug = String(req.params.slug ?? "");
            if (!slug || slug.length > BLOG_LIMITS.slug) {
                throw new CustomError(ResponseMessages.BLOG_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const data = await this._getBlogBySlugUseCase.execute(slug);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data,
            });
        } catch (error) {
            console.log("Error in getBlogBySlug:", error);
            handleError(res, error);
        }
    }
}
