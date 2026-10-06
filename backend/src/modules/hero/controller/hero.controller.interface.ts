import type { Request, Response } from "express";

export interface IHeroController {
    createHero(req: Request, res: Response): Promise<void>;
    editHero(req: Request, res: Response): Promise<void>;
    blockHero(req: Request, res: Response): Promise<void>;
    unblockHero(req: Request, res: Response): Promise<void>;
    getHeroForAdmin(req: Request, res: Response): Promise<void>;
    getHeroForUser(req: Request, res: Response): Promise<void>;
    getHeroById(req: Request, res: Response): Promise<void>;
}
