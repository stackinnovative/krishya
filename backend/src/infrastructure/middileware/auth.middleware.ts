import type { Response, NextFunction } from "express";


import { injectable, inject } from "tsyringe";
import type { IAuthenticate } from "./auth.middleware.interface.js";
import type { ITokenService } from "../../core/ports/token.service.interface.js";
import type { IUserRepository } from "../../modules/user/repositories/user.repository.interface.js";
import type { AuthRequest } from "./auth.type.js";
import { HttpStatusCode } from "../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../core/constants/response.message.js";




@injectable()
export class Authenticate implements IAuthenticate {
  constructor(
    @inject("ITokenService") private readonly tokenService: ITokenService,
    @inject("IUserRepository") private readonly userRepo: IUserRepository
  ) { }

  authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const accessToken = req.cookies.access_token;


    if (!accessToken) {

      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: ResponseMessages.UNAUTHORIZED });
      return
    }


    try {

      const decoded = (await this.tokenService.verifyAccessToken(
        accessToken
      )) as {
        id: string;
        role: string;
      };

      const user = await this.userRepo.findById(decoded.id);

      if (!user) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .json({ message: ResponseMessages.UNAUTHORIZED });
        return
      }


      if (user.isBlocked) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .json({ message: ResponseMessages.ACCESS_DENIED });
        return
      }

      req.user = decoded;
      next();

    } catch (error) {
      console.log("inside catch ", error)
      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: ResponseMessages.UNAUTHORIZED });
      return
    }
  }


}
