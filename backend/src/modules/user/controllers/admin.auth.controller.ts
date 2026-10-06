import type { Request, Response } from "express";
import type { IAdminController } from "./interfaces/admin.auth.controller.interface.js";
import { injectable, inject} from 'tsyringe'
import { LoginUserSchema } from "../dtos/login.request.dto.js";
import type { LoginRequestDto } from "../dtos/login.request.dto.js";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../../../core/utils/auth.helpers.js";
import type { IAdminLoginUseCase } from "../use-cases/interfaces/admin.login.use-case.interface.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";



@injectable()
export class AdminController implements IAdminController {
    constructor(
        @inject('IAdminLoginUseCase') private readonly adminLoginUseCase: IAdminLoginUseCase
    ){}

    async loginAdminController(req: Request, res: Response): Promise<void> {
        try {
            const dto: LoginRequestDto = LoginUserSchema.parse(req.body)
            const {userData, accessToken, refreshToken} = await this.adminLoginUseCase.execute(dto)
            setAccessTokenCookie(res, accessToken);
            setRefreshTokenCookie(res, refreshToken);
            res.status(HttpStatusCode.OK).json({
                data: userData,
                success: true,
                message: ResponseMessages.LOGIN_SUCCESS
            })
            
        } catch (error) {
            console.log("error in admin login ",error)
            handleError(res,error)
        }
    }
}