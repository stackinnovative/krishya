import { inject, injectable } from "tsyringe";

import type { IGetAllBlogAdminUseCase } from "./interfaces/get.all.blog.admin.use-case.interface.js";
import type { IBlogRepository } from "../repositories/blog.repository.interface.js";
import type { GetAllQueryDto } from "../../../core/shared/dtos/get.all.doc.dto.js";
import { BLOG_CATEGORIES, BLOG_STATUSES, type AdminBlogListView, type BlogCategory, type BlogStatus, type PaginatedBlogList } from "../types/blog.type.js";

@injectable()
export class GetAllBlogAdminUseCase implements IGetAllBlogAdminUseCase {
    constructor(
        @inject("IBlogRepository")
        private readonly _blogRepository: IBlogRepository
    ) { }

    async execute(dto: GetAllQueryDto): Promise<PaginatedBlogList<AdminBlogListView>> {
        const { page, limit, search, sortValue, filters } = dto;

        // Unknown filter values are ignored rather than returning an error page.
        const status = BLOG_STATUSES.find((s): s is BlogStatus => s === filters.status);
        const category = BLOG_CATEGORIES.find((c): c is BlogCategory => c === filters.category);

        return this._blogRepository.findAllForAdmin({
            page,
            limit,
            search,
            status,
            category,
            sort: sortValue === "oldest" ? "oldest" : "newest",
        });
    }
}
