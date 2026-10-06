import { inject, injectable } from "tsyringe";
import type { IAuthController } from "./interfaces/auth.controller.interface.js";
import type { IGetCurrentUserUseCase } from "../use-cases/interfaces/get.current.user.use-case.interface.js";
import type { AuthRequest } from "../../../infrastructure/middileware/auth.type.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";
import type { Response, Request } from "express";
import { cookieOptions, setAccessTokenCookie, setRefreshTokenCookie } from "../../../core/utils/auth.helpers.js";
import type { IUserRefreshTokenUseCase } from "../use-cases/interfaces/user.refresh.token.use-case.interface.js";

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject('IGetCurrentUserUseCase')
    private readonly _getCurrentUserUseCase: IGetCurrentUserUseCase,
    @inject('IUserRefreshTokenUseCase')
    private readonly _userRefreshTokenUseCase: IUserRefreshTokenUseCase
  ) { }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { user } = req
      const userData = await this._getCurrentUserUseCase.execute(user.id);
      res.status(HttpStatusCode.OK).json({
        message: ResponseMessages.LOGIN_SUCCESS,
        data: userData,
        success: true,
      });
    } catch (error) {
      console.log("error in admin login", error);
      handleError(res, error);
    }
  }

  async logoutUserController(req: Request, res: Response): Promise<void> {
    try {
      res.cookie("access_token", "", {
        ...cookieOptions,
        maxAge: 0,
      });

      res.cookie("refresh_token", "", {
        ...cookieOptions,
        maxAge: 0,
      });

      res.status(HttpStatusCode.OK).json({
        message: ResponseMessages.LOGOUT_SUCCESS,
        success: true,
      });
    } catch (error) {
      console.log("error in user logout", error);
      handleError(res, error);
    }
  }

  async getRefreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refresh_token = req.cookies.refresh_token;
      const { userData, accessToken, refreshToken } =
        await this._userRefreshTokenUseCase.execute(refresh_token);
      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);
      res.status(HttpStatusCode.OK).json({
        message: ResponseMessages.LOGIN_SUCCESS,
        data: userData,
        success: true,
      });
    } catch (error) {
      //console.log("error in user refresh token", error);
      handleError(res, error);
    }
  }
}