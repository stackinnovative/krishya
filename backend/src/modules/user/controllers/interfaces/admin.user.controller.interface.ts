import type { Request, Response } from "express";

export interface IAdminUserController {
  getAdminUsers(req: Request, res: Response): Promise<void>;
  getAdminUserDetail(req: Request, res: Response): Promise<void>;
  createAdminUser(req: Request, res: Response): Promise<void>;
  updateAdminUser(req: Request, res: Response): Promise<void>;
  blockAdminUser(req: Request, res: Response): Promise<void>;
  unblockAdminUser(req: Request, res: Response): Promise<void>;
}
