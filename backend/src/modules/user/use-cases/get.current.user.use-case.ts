import { inject, injectable } from "tsyringe";
import type { IGetCurrentUserUseCase } from "./interfaces/get.current.user.use-case.interface.js";
import type { IUserRepository } from "../repositories/user.repository.interface.js";
import type { LoginResponseDto } from "../dtos/login.response.dto.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

@injectable()
export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {
  constructor(
    @inject("IUserRepository") private readonly _userRepository: IUserRepository
  ) { }
  async execute(id: string): Promise<LoginResponseDto> {
    const user = await this._userRepository.findById(id);

    if (!user) {
      throw new CustomError(
        ResponseMessages.INVALID_CREDENTIALS,
        HttpStatusCode.FORBIDDEN
      );
    }
    const userData: LoginResponseDto = {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    return userData;
  }
}
