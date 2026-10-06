export interface IBlockBannerUseCase {
    execute(id: string): Promise<void>;
}
