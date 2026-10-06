import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import type { IUserRepository } from "../repositories/user.repository.interface.js";
import type { IBlockAdminUserUseCase } from "./interfaces/block.admin.user.use-case.interface.js";

@injectable()
export class BlockAdminUserUseCase implements IBlockAdminUserUseCase {
  constructor(
    @inject("IUserRepository")
    private readonly _userRepository: IUserRepository,
  ) { }

  async execute(id: string): Promise<void> {
    const user = await this._userRepository.findById(id);

    if (!user) {
      throw new CustomError(ResponseMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
    }

    if (user.isBlocked) {
      throw new CustomError(ResponseMessages.USER_ALREADY_BLOCKED, HttpStatusCode.BAD_REQUEST);
    }

    const blocked = user.block();
    await this._userRepository.save(blocked);
  }
}
