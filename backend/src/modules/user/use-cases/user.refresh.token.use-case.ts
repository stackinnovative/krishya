import { inject, injectable } from "tsyringe";
import type { IUserRefreshTokenUseCase } from "./interfaces/user.refresh.token.use-case.interface.js";
import type { ITokenService } from "../../../core/ports/token.service.interface.js";
import type { IUserRepository } from "../repositories/user.repository.interface.js";
import type { LoginResponseDto } from "../dtos/login.response.dto.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";



@injectable()
export class UserRefreshTokenUseCase implements IUserRefreshTokenUseCase {
  constructor(
    @inject("ITokenService")
    private readonly _tokenService: ITokenService,

    @inject("IUserRepository")
    private readonly _userRepository: IUserRepository
  ) { }

  async execute(
    refresh_Token: string
  ): Promise<{
    userData: LoginResponseDto;
    accessToken: string;
    refreshToken: string;
  }> {

    if (!refresh_Token) {
      console.log("no refresh token")
      throw new CustomError(
        ResponseMessages.REFRESH_TOKEN_REQUIRED,
        HttpStatusCode.BAD_REQUEST
      )
    }


    const decoded = (await this._tokenService.verifyRefreshToken(
      refresh_Token
    )) as {
      id: string;
      role: string;
      tokenVersion: number
    };

    const user = await this._userRepository.findById(decoded.id);

    if (!user) {
      throw new CustomError(
        ResponseMessages.USER_NOT_FOUND,
        HttpStatusCode.FORBIDDEN
      )
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      throw new CustomError(
        ResponseMessages.REFRESH_TOKEN_INVALID,
        HttpStatusCode.FORBIDDEN
      )
    }

    if (user.isBlocked) {
      throw new CustomError(
        ResponseMessages.USER_NOT_VERIFIED,
        HttpStatusCode.FORBIDDEN
      )
    }
    const updateUser = user.incrementTokenVersion()
    const newUser = await this._userRepository.save(updateUser)

    const tokenPayload = { id: newUser.id!, role: newUser.role };
    const refreshTokenPlayLoad = { id: newUser.id!, role: newUser.role, tokenVersion: newUser.tokenVersion }
    const accessToken = await this._tokenService.signAccessToken(tokenPayload);
    const refreshToken = await this._tokenService.signRefreshToken(refreshTokenPlayLoad);

    const responseData: LoginResponseDto = {
      user: {
        id: newUser.id!,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };

    return { userData: responseData, accessToken, refreshToken }
  }
}
