import type { Request, Response } from "express";

export interface IBannerController {
    createBanner(req: Request, res: Response): Promise<void>;
    editBanner(req: Request, res: Response): Promise<void>;
    blockBanner(req: Request, res: Response): Promise<void>;
    unblockBanner(req: Request, res: Response): Promise<void>;
    getBannerForAdmin(req: Request, res: Response): Promise<void>;
    getBannerForUser(req: Request, res: Response): Promise<void>;
    getBannerById(req: Request, res: Response): Promise<void>;
    deleteBanner(req: Request, res: Response): Promise<void>;
}
