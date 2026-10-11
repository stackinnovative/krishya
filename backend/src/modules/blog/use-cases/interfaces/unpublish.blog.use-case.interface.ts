export interface IUnpublishBlogUseCase {
    execute(id: string): Promise<void>;
}
