import type { Request, Response } from "express"

export interface IAdminController {
    loginAdminController(req: Request, res: Response): Promise<void>
}