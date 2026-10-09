import type { AdminBlogView } from "../../types/blog.type.js";

export interface IGetBlogAdminUseCase {
    execute(id: string): Promise<AdminBlogView>;
}
