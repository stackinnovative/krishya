import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IPublishBlogUseCase } from "./interfaces/publish.blog.use-case.interface.js";
import type { IBlogRepository } from "../repositories/blog.repository.interface.js";

@injectable()
export class PublishBlogUseCase implements IPublishBlogUseCase {
    constructor(
        @inject("IBlogRepository")
        private readonly _blogRepository: IBlogRepository
    ) { }

    async execute(id: string): Promise<void> {
        const blog = await this._blogRepository.findById(id);
        if (!blog) {
            throw new CustomError(ResponseMessages.BLOG_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        if (blog.status === "published") {
            throw new CustomError(ResponseMessages.BLOG_ALREADY_PUBLISHED, HttpStatusCode.BAD_REQUEST);
        }
        if (!blog.coverImage) {
            throw new CustomError(ResponseMessages.BLOG_COVER_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        await this._blogRepository.save(blog.publish(new Date()));
    }
}
