import { inject, injectable } from "tsyringe";

import type { IGetFeaturedBlogUseCase } from "./interfaces/get.featured.blog.use-case.interface.js";
import type { IBlogRepository } from "../repositories/blog.repository.interface.js";
import type { BlogListView } from "../types/blog.type.js";

@injectable()
export class GetFeaturedBlogUseCase implements IGetFeaturedBlogUseCase {
    constructor(
        @inject("IBlogRepository")
        private readonly _blogRepository: IBlogRepository
    ) { }

    async execute(): Promise<BlogListView | null> {
        return this._blogRepository.findFeaturedPublished(new Date());
    }
}
