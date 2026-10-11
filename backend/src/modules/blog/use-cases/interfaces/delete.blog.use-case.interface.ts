export interface IDeleteBlogUseCase {
    execute(id: string, permanent?: boolean): Promise<void>;
    restore(id: string): Promise<void>;
}
