import type { GetAllQueryDto } from "../../../../core/shared/dtos/get.all.doc.dto.js";
import type { AdminUserView } from "../../types/user.type.js";

export interface IGetAdminUsersUseCase {
  execute(dto: GetAllQueryDto): Promise<{ data: AdminUserView[]; total: number }>;
}
