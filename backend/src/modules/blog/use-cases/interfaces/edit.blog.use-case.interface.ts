import type { EditBlogRequestDto } from "../../dtos/blog.dto.js";
import type { AdminBlogView } from "../../types/blog.type.js";

export interface IEditBlogUseCase {
    execute(id: string, dto: EditBlogRequestDto): Promise<AdminBlogView>;
}
