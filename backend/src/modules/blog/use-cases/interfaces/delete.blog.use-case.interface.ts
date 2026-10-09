export interface IDeleteBlogUseCase {
    execute(id: string): Promise<void>;
}
