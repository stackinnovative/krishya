import { injectable, inject } from "tsyringe";
import type { LoginRequestDto } from "../dtos/login.request.dto.js";
import type { IUserRepository } from "../repositories/user.repository.interface.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import type { LoginResponseDto } from "../dtos/login.response.dto.js";
import type { IAdminLoginUseCase } from "./interfaces/admin.login.use-case.interface.js";
import { IHashingService } from "../../../core/ports/hashing.service.interface.js";
import { ITokenService } from "../../../core/ports/token.service.interface.js";

@injectable()
export class AdminLoginUseCase implements IAdminLoginUseCase {
  constructor(
    @inject("IUserRepository") private readonly _userRepository: IUserRepository,
    @inject("IHashingService") private readonly _hashService: IHashingService,
    @inject('ITokenService') private readonly _tokenService: ITokenService
  ) {}

  async execute(dto: LoginRequestDto): Promise<{
    userData: LoginResponseDto;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this._userRepository.findByEmail(dto.email);

    if (!user) {
      throw new CustomError(
        ResponseMessages.INVALID_CREDENTIALS,
        HttpStatusCode.BAD_REQUEST
      );
    }

    const isValid = await this._hashService.compare(dto.password, user.password!)

    if(!isValid){
      throw new CustomError(
        ResponseMessages.INVALID_CREDENTIALS,
        HttpStatusCode.BAD_REQUEST
      )
    }

    if(!user.isVerified){
      throw new CustomError(
        ResponseMessages.USER_NOT_VERIFIED,
        HttpStatusCode.BAD_REQUEST
      )
    }

    if(user.isBlocked){
      throw new CustomError(
        ResponseMessages.ACCESS_DENIED,
        HttpStatusCode.BAD_REQUEST
      )
    }

    if(user.role !== 'admin'){
        throw new CustomError(
        ResponseMessages.UNAUTHORIZED,
        HttpStatusCode.BAD_REQUEST
      )
    }

    const tokenPayload = { id: user.id!, role: user.role };
    const refreshTokenPlayLoad = { id: user.id!, role: user.role, tokenVersion: user.tokenVersion }
    const accessToken = await this._tokenService.signAccessToken(tokenPayload);
    const refreshToken = await this._tokenService.signRefreshToken(refreshTokenPlayLoad);

    const responseData: LoginResponseDto = {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    return { userData: responseData, accessToken, refreshToken }
  }
}
