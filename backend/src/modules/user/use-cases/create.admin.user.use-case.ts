import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { User } from "../entities/user.entity.js";
import type { ICreateAdminUserUseCase } from "./interfaces/create.admin.user.use-case.interface.js";
import type { IUserRepository } from "../repositories/user.repository.interface.js";
import type { CreateAdminUserRequestDto } from "../dtos/create.admin.user.dto.js";
import type { AdminUserView } from "../types/user.type.js";
import { IHashingService } from "../../../core/ports/hashing.service.interface.js";

@injectable()
export class CreateAdminUserUseCase implements ICreateAdminUserUseCase {
  constructor(
    @inject("IUserRepository")
    private readonly _userRepository: IUserRepository,
    @inject("IHashingService")
    private readonly _hashService: IHashingService,
  ) { }

  async execute(dto: CreateAdminUserRequestDto): Promise<AdminUserView> {
    const existing = await this._userRepository.findByEmail(dto.email);
    if (existing) {
      throw new CustomError(ResponseMessages.EMAIL_ALREADY_EXISTS, HttpStatusCode.BAD_REQUEST);
    }

    const hashedPassword = await this._hashService.hash(dto.password);

    // Created directly from the admin panel - verified and unblocked from
    // the start, unlike a guest/checkout account that starts unverified.
    const userEntity = new User({
      id: null,
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? "",
      role: dto.role,
      password: hashedPassword,
      isVerified: true,
      isBlocked: false,
      isGuest: false,
      tokenVersion: 0,
    });

    const created = await this._userRepository.create(userEntity);

    const view = await this._userRepository.getAdminUserDetail(created.id!);
    if (!view) {
      throw new CustomError(ResponseMessages.FAILED_TO_MAP, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }

    return view;
  }
}
