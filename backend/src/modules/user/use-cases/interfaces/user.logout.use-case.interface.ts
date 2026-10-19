export interface IUserLogoutUseCase {
  execute(refreshToken: string | undefined): Promise<void>;
}
