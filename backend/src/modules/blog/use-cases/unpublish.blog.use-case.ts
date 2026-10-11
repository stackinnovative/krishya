import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IUnpublishBlogUseCase } from "./interfaces/unpublish.blog.use-case.interface.js";
import type { IBlogRepository } from "../repositories/blog.repository.interface.js";

@injectable()
export class UnpublishBlogUseCase implements IUnpublishBlogUseCase {
    constructor(
        @inject("IBlogRepository")
        private readonly _blogRepository: IBlogRepository
    ) { }

    async execute(id: string): Promise<void> {
        const blog = await this._blogRepository.findById(id);
        if (!blog) {
            throw new CustomError(ResponseMessages.BLOG_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        if (blog.status === "draft") {
            throw new CustomError(ResponseMessages.BLOG_ALREADY_DRAFT, HttpStatusCode.BAD_REQUEST);
        }

        await this._blogRepository.save(blog.unpublish());
    }
}
