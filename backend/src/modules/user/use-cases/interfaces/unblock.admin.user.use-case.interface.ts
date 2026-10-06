export interface IUnblockAdminUserUseCase {
  execute(id: string): Promise<void>;
}
