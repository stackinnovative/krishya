import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import type { IUpdateAdminUserUseCase } from "./interfaces/update.admin.user.use-case.interface.js";
import type { IUserRepository } from "../repositories/user.repository.interface.js";
import type { UpdateAdminUserRequestDto } from "../dtos/update.admin.user.dto.js";
import type { AdminUserView } from "../types/user.type.js";
import { IHashingService } from "../../../core/ports/hashing.service.interface.js";

@injectable()
export class UpdateAdminUserUseCase implements IUpdateAdminUserUseCase {
  constructor(
    @inject("IUserRepository")
    private readonly _userRepository: IUserRepository,
    @inject("IHashingService")
    private readonly _hashService: IHashingService,
  ) { }

  async execute(userId: string, dto: UpdateAdminUserRequestDto): Promise<AdminUserView> {
    const existing = await this._userRepository.findById(userId);
    if (!existing) {
      throw new CustomError(ResponseMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
    }

    if (dto.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailTaken = await this._userRepository.findByEmail(dto.email);
      if (emailTaken) {
        throw new CustomError(ResponseMessages.EMAIL_ALREADY_EXISTS, HttpStatusCode.BAD_REQUEST);
      }
    }

    // A guest/checkout account never had a login password set - promoting
    // one to "admin" without also setting a password would create an
    // account that can never actually log in.
    if (dto.role === "admin" && !existing.password && !dto.password) {
      throw new CustomError(ResponseMessages.PASSWORD_REQUIRED_FOR_ADMIN, HttpStatusCode.BAD_REQUEST);
    }

    let updated = existing.updateProfile({ name: dto.name, email: dto.email, phone: dto.phone }).changeRole(dto.role);

    if (dto.password) {
      const hashedPassword = await this._hashService.hash(dto.password);
      updated = updated.changePassword(hashedPassword);
    }

    const saved = await this._userRepository.save(updated);

    const view = await this._userRepository.getAdminUserDetail(saved.id!);
    if (!view) {
      throw new CustomError(ResponseMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
    }

    return view;
  }
}
