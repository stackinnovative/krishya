import type { UserBlogView } from "../../types/blog.type.js";

export interface IGetBlogBySlugUseCase {
    execute(slug: string): Promise<UserBlogView>;
}
