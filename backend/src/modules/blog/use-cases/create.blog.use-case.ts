import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { ICreateBlogUseCase } from "./interfaces/create.blog.use-case.interface.js";
import type { IBlogRepository } from "../repositories/blog.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import type { CreateBlogRequestDto } from "../dtos/blog.dto.js";
import type { AdminBlogView } from "../types/blog.type.js";
import { Blog, resolvePublishedAt } from "../entities/blog.entity.js";
import { BlogMapper } from "../mappers/blog.mapper.js";
import { blogContentFromDto, requestedPublishDate } from "../utils/blog.input.helper.js";

@injectable()
export class CreateBlogUseCase implements ICreateBlogUseCase {
    constructor(
        @inject("IBlogRepository")
        private readonly _blogRepository: IBlogRepository,

        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository
    ) { }

    async execute(dto: CreateBlogRequestDto): Promise<AdminBlogView> {
        const content = blogContentFromDto(dto);

        if (await this._blogRepository.isSlugTaken(content.slug)) {
            throw new CustomError(ResponseMessages.BLOG_SLUG_ALREADY_EXISTS, HttpStatusCode.CONFLICT);
        }

        const blog = new Blog({
            ...content,
            status: dto.status,
            publishedAt: resolvePublishedAt(dto.status, requestedPublishDate(dto), null, new Date()),
        });

        const created = await this._blogRepository.create(blog);
        if (!created?.id) {
            throw new CustomError(ResponseMessages.BLOG_SAVE_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const products = await this._productRepository.findByIds(created.productIds);
        return BlogMapper.toAdminView(created, products);
    }
}
