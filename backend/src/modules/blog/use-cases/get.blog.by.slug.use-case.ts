import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IGetBlogBySlugUseCase } from "./interfaces/get.blog.by.slug.use-case.interface.js";
import type { IBlogRepository } from "../repositories/blog.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import type { UserBlogView } from "../types/blog.type.js";
import { BlogMapper } from "../mappers/blog.mapper.js";

const RELATED_COUNT = 3;

@injectable()
export class GetBlogBySlugUseCase implements IGetBlogBySlugUseCase {
    constructor(
        @inject("IBlogRepository")
        private readonly _blogRepository: IBlogRepository,

        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository
    ) { }

    async execute(slug: string): Promise<UserBlogView> {
        const now = new Date();
        const blog = await this._blogRepository.findPublishedBySlug(slug, now);
        if (!blog) {
            throw new CustomError(ResponseMessages.BLOG_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const [products, related] = await Promise.all([
            this._productRepository.findByIds(blog.productIds),
            this._blogRepository.findRelated(blog, RELATED_COUNT, now),
        ]);

        return BlogMapper.toUserView(blog, products, related);
    }
}
