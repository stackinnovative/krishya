import type { CreateBlogRequestDto } from "../../dtos/blog.dto.js";
import type { AdminBlogView } from "../../types/blog.type.js";

export interface ICreateBlogUseCase {
    execute(dto: CreateBlogRequestDto): Promise<AdminBlogView>;
}
