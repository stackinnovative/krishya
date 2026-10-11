import type { BlogListView } from "../../types/blog.type.js";

export interface IGetFeaturedBlogUseCase {
    execute(): Promise<BlogListView | null>;
}
