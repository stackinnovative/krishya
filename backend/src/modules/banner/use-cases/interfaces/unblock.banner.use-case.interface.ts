export interface IUnblockBannerUseCase {
    execute(id: string): Promise<void>;
}
