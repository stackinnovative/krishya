import { inject, injectable } from "tsyringe";
import type { IGetAdminUsersUseCase } from "./interfaces/get.admin.users.use-case.interface.js";
import type { IUserRepository } from "../repositories/user.repository.interface.js";
import type { AdminUserView } from "../types/user.type.js";
import type { GetAllQueryDto } from "../../../core/shared/dtos/get.all.doc.dto.js";
import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";

@injectable()
export class GetAdminUsersUseCase implements IGetAdminUsersUseCase {
  constructor(
    @inject("IUserRepository")
    private readonly _userRepository: IUserRepository,
  ) { }

  async execute(dto: GetAllQueryDto): Promise<{ data: AdminUserView[]; total: number }> {
    const { page, search, limit, sortValue, filters } = dto;

    // No role filter = every account (customers + admin/staff). Pass
    // ?role=user or ?role=admin to scope to one or the other.
    const query: Record<string, any> = {};
    if (filters?.role === "user" || filters?.role === "admin") {
      query.role = filters.role;
    }
    if (typeof filters?.isBlocked === "boolean") {
      query.isBlocked = filters.isBlocked;
    }
    let sort: Record<string, any> = { createdAt: -1 };

    /* ---------- sorting ---------- */
    if (sortValue === "oldest") {
      sort = { createdAt: 1 };
    } else if (sortValue === "newest") {
      sort = { createdAt: -1 };
    } else if (sortValue === "name_asc") {
      sort = { name: 1 };
    } else if (sortValue === "name_desc") {
      sort = { name: -1 };
    }

    if (search && search.trim() !== "") {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const allDoc: IGetAllDocDB = { page, limit, query, sort };

    const documents = await this._userRepository.getAdminUserList(allDoc);
    const total = await this._userRepository.countDocuments(query);

    return { data: documents, total };
  }
}
