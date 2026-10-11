import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IGetBlogAdminUseCase } from "./interfaces/get.blog.admin.use-case.interface.js";
import type { IBlogRepository } from "../repositories/blog.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import type { AdminBlogView } from "../types/blog.type.js";
import { BlogMapper } from "../mappers/blog.mapper.js";

@injectable()
export class GetBlogAdminUseCase implements IGetBlogAdminUseCase {
    constructor(
        @inject("IBlogRepository")
        private readonly _blogRepository: IBlogRepository,

        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository
    ) { }

    async execute(id: string): Promise<AdminBlogView> {
        const blog = await this._blogRepository.findById(id);
        if (!blog) {
            throw new CustomError(ResponseMessages.BLOG_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const products = await this._productRepository.findByIds(blog.productIds);
        return BlogMapper.toAdminView(blog, products);
    }
}
