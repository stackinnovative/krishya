import type { CreateAdminUserRequestDto } from "../../dtos/create.admin.user.dto.js";
import type { AdminUserView } from "../../types/user.type.js";

export interface ICreateAdminUserUseCase {
  execute(dto: CreateAdminUserRequestDto): Promise<AdminUserView>;
}
