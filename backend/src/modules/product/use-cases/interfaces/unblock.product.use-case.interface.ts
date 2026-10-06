export interface IUnblockProductUseCase {
  execute(id: string): Promise<void>;
}