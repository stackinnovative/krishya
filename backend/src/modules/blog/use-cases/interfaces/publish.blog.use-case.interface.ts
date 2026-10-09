export interface IPublishBlogUseCase {
    execute(id: string): Promise<void>;
}
