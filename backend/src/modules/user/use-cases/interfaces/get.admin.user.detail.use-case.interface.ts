import type { AdminUserView } from "../../types/user.type.js";

export interface IGetAdminUserDetailUseCase {
  execute(userId: string): Promise<AdminUserView>;
}
