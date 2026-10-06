import type { Request, Response } from "express"
import type { AuthRequest } from "../../../../infrastructure/middileware/auth.type.js"


export interface IAuthController {
    getCurrentUser( req: AuthRequest, res: Response): Promise<void>
    logoutUserController( req: AuthRequest, res: Response): Promise<void>
    getRefreshToken( req: Request, res: Response): Promise<void>
}