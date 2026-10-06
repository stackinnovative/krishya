export interface IBlockCategoryUseCase {
  execute(id: string): Promise<void>;
}