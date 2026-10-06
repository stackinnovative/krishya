export interface IBlockAdminUserUseCase {
  execute(id: string): Promise<void>;
}
