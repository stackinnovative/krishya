import { inject, injectable } from "tsyringe";

import type { IGetAllBlogUserUseCase } from "./interfaces/get.all.blog.user.use-case.interface.js";
import type { IBlogRepository } from "../repositories/blog.repository.interface.js";
import type { GetAllQueryDto } from "../../../core/shared/dtos/get.all.doc.dto.js";
import { BLOG_CATEGORIES, type BlogCategory, type BlogListView, type PaginatedBlogList } from "../types/blog.type.js";

const OBJECT_ID = /^[a-f\d]{24}$/i;

@injectable()
export class GetAllBlogUserUseCase implements IGetAllBlogUserUseCase {
    constructor(
        @inject("IBlogRepository")
        private readonly _blogRepository: IBlogRepository
    ) { }

    async execute(dto: GetAllQueryDto): Promise<PaginatedBlogList<BlogListView>> {
        const { page, limit, filters } = dto;

        const category = BLOG_CATEGORIES.find((c): c is BlogCategory => c === filters.category);
        const excludeId = typeof filters.excludeId === "string" && OBJECT_ID.test(filters.excludeId) ? filters.excludeId : undefined;

        return this._blogRepository.findPublished({ page, limit, category, excludeId }, new Date());
    }
}
