import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { deleteCloudinaryImage } from "../../../core/utils/delete.image.helper.js";

import type { IDeleteBlogUseCase } from "./interfaces/delete.blog.use-case.interface.js";
import type { IBlogRepository } from "../repositories/blog.repository.interface.js";

@injectable()
export class DeleteBlogUseCase implements IDeleteBlogUseCase {
    constructor(
        @inject("IBlogRepository")
        private readonly _blogRepository: IBlogRepository
    ) { }

    async execute(id: string, permanent = false): Promise<void> {
        const blog = await this._blogRepository.findById(id, permanent);
        if (!blog) {
            throw new CustomError(ResponseMessages.BLOG_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (!permanent) {
            await this._blogRepository.softDelete(id);
            return;
        }
        await this._blogRepository.delete(id);

        await Promise.all(
            blog.imageIds.map((publicId) =>
                this.removeImage(publicId).catch((err) => console.error("Could not delete blog image:", publicId, err))
            )
        );
    }

    async restore(id: string): Promise<void> {
        const blog = await this._blogRepository.findById(id, true);
        if (!blog) throw new CustomError(ResponseMessages.BLOG_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        if (!blog.deletedAt) throw new CustomError("This article is not blocked.", HttpStatusCode.BAD_REQUEST);
        await this._blogRepository.restore(id);
    }

    /** Deletes a photo from Cloudinary (overridden in tests). */
    protected removeImage(publicId: string): Promise<void> {
        return deleteCloudinaryImage(publicId);
    }
}
