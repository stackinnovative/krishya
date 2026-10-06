export interface IDeleteBannerUseCase {
    execute(id: string): Promise<void>;
}
