import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { toSlug, type BlogContent } from "../entities/blog.entity.js";
import type { CreateBlogRequestDto } from "../dtos/blog.dto.js";

/** The editable fields of a create/edit request, with the slug normalized (or taken from the title). */
export const blogContentFromDto = (dto: CreateBlogRequestDto): BlogContent => {
    const slug = toSlug(dto.slug) || toSlug(dto.title);
    if (!slug) {
        throw new CustomError(ResponseMessages.BLOG_SLUG_INVALID, HttpStatusCode.BAD_REQUEST);
    }

    return {
        title: dto.title,
        slug,
        category: dto.category,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        blocks: dto.blocks,
        isFeatured: dto.isFeatured,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
    };
};

/** undefined = not sent (keep the current date), null = cleared, otherwise the chosen date. */
export const requestedPublishDate = (dto: CreateBlogRequestDto): Date | null | undefined =>
    dto.publishedAt === undefined ? undefined : dto.publishedAt === null ? null : new Date(dto.publishedAt);
