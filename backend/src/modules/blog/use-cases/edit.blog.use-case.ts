import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { deleteCloudinaryImage } from "../../../core/utils/delete.image.helper.js";

import type { IEditBlogUseCase } from "./interfaces/edit.blog.use-case.interface.js";
import type { IBlogRepository } from "../repositories/blog.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import type { EditBlogRequestDto } from "../dtos/blog.dto.js";
import type { AdminBlogView } from "../types/blog.type.js";
import { resolvePublishedAt } from "../entities/blog.entity.js";
import { BlogMapper } from "../mappers/blog.mapper.js";
import { blogContentFromDto, requestedPublishDate } from "../utils/blog.input.helper.js";

@injectable()
export class EditBlogUseCase implements IEditBlogUseCase {
    constructor(
        @inject("IBlogRepository")
        private readonly _blogRepository: IBlogRepository,

        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository
    ) { }

    async execute(id: string, dto: EditBlogRequestDto): Promise<AdminBlogView> {
        const current = await this._blogRepository.findById(id);
        if (!current) {
            throw new CustomError(ResponseMessages.BLOG_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const content = blogContentFromDto(dto);
        if (content.slug !== current.slug && (await this._blogRepository.isSlugTaken(content.slug, id))) {
            throw new CustomError(ResponseMessages.BLOG_SLUG_ALREADY_EXISTS, HttpStatusCode.CONFLICT);
        }

        const next = current.updateDetails({
            ...content,
            status: dto.status,
            publishedAt: resolvePublishedAt(dto.status, requestedPublishDate(dto), current.publishedAt, new Date()),
        });

        const saved = await this._blogRepository.save(next);
        if (!saved) {
            throw new CustomError(ResponseMessages.BLOG_SAVE_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        // Only once the save succeeded: photos the article no longer uses are
        // orphaned. A failed delete just leaves a stray file, so it never fails the save.
        await Promise.all(
            current.replacedImageIds(saved).map((publicId) =>
                this.removeImage(publicId).catch((err) => console.error("Could not delete replaced blog image:", publicId, err))
            )
        );

        const products = await this._productRepository.findByIds(saved.productIds);
        return BlogMapper.toAdminView(saved, products);
    }

    /** Deletes a replaced photo from Cloudinary (overridden in tests). */
    protected removeImage(publicId: string): Promise<void> {
        return deleteCloudinaryImage(publicId);
    }
}
