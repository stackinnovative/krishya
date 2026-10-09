import type { Request, Response } from "express";

export interface IAboutController {
    getAbout(req: Request, res: Response): Promise<void>;
    updateAbout(req: Request, res: Response): Promise<void>;
}
