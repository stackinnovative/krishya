export interface IUnblockCategoryUseCase {
  execute(id: string): Promise<void>;
}