import type { GetAllQueryDto } from "../../../../core/shared/dtos/get.all.doc.dto.js";
import type { AdminBlogListView, PaginatedBlogList } from "../../types/blog.type.js";

export interface IGetAllBlogAdminUseCase {
    execute(dto: GetAllQueryDto): Promise<PaginatedBlogList<AdminBlogListView>>;
}
