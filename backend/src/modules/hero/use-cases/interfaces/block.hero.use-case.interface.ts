export interface IBlockHeroUseCase {
    execute(id: string): Promise<void>;
}
