import { inject, injectable } from "tsyringe";
import type { IGetAdminUserDetailUseCase } from "./interfaces/get.admin.user.detail.use-case.interface.js";
import type { IUserRepository } from "../repositories/user.repository.interface.js";
import type { AdminUserView } from "../types/user.type.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

@injectable()
export class GetAdminUserDetailUseCase implements IGetAdminUserDetailUseCase {
  constructor(
    @inject("IUserRepository")
    private readonly _userRepository: IUserRepository,
  ) { }

  async execute(userId: string): Promise<AdminUserView> {
    const user = await this._userRepository.getAdminUserDetail(userId);

    if (!user) {
      throw new CustomError(ResponseMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
    }

    return user;
  }
}
