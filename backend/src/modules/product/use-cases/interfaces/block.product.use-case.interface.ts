export interface IBlockProductUseCase {
  execute(id: string): Promise<void>;
}