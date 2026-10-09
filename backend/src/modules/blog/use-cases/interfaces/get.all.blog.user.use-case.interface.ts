import type { GetAllQueryDto } from "../../../../core/shared/dtos/get.all.doc.dto.js";
import type { BlogListView, PaginatedBlogList } from "../../types/blog.type.js";

export interface IGetAllBlogUserUseCase {
    execute(dto: GetAllQueryDto): Promise<PaginatedBlogList<BlogListView>>;
}
