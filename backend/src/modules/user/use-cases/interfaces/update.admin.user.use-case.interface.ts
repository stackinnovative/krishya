import type { UpdateAdminUserRequestDto } from "../../dtos/update.admin.user.dto.js";
import type { AdminUserView } from "../../types/user.type.js";

export interface IUpdateAdminUserUseCase {
  execute(userId: string, dto: UpdateAdminUserRequestDto): Promise<AdminUserView>;
}
