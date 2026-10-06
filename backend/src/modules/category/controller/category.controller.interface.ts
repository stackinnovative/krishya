import type { Request, Response } from "express";

export interface ICategoryController {
  createCategory(req: Request, res: Response): Promise<void>;
  editCategory(req: Request, res: Response): Promise<void>;
  getCategoryById(req: Request, res: Response): Promise<void>;
  getAllCategoriesForAdmin(req: Request, res: Response): Promise<void>;
  blockCategory(req: Request, res: Response): Promise<void>;
  unblockCategory(req: Request, res: Response): Promise<void>;
  getActiveCategoriesForUser(req: Request, res: Response): Promise<void>;
  getSignatureCategories(req: Request, res: Response): Promise<void>;
}
