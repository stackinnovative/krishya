import type { Request, Response } from "express";

export interface IWishlistController {
  toggleWishlist(req: Request, res: Response): Promise<void>;
  getWishlist(req: Request, res: Response): Promise<void>;
  getWishlistIds(req: Request, res: Response): Promise<void>;
}
