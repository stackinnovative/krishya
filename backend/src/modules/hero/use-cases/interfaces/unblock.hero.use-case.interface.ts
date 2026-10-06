export interface IUnblockHeroUseCase {
    execute(id: string): Promise<void>;
}
