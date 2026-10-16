import type { Request, Response } from "express";

export interface IProductController {
  createProduct(req: Request, res: Response): Promise<void>;
  editProduct(req: Request, res: Response): Promise<void>;
  getAllProductForAdmin(req: Request, res: Response): Promise<void>;
  blockProduct(req: Request, res: Response): Promise<void>;
  unblockProduct(req: Request, res: Response): Promise<void>;
  addVariant(req: Request, res: Response): Promise<void>
  editVariant(req: Request, res: Response): Promise<void>
  getProductDetailsForAdmin(req: Request, res: Response): Promise<void>
  getProductDetailsForUser(req: Request, res: Response): Promise<void>
  getAdminProductVariant(req: Request, res: Response): Promise<void>
  getFeaturedProducts(req: Request, res: Response): Promise<void>
  getAllProductForUser(req: Request, res: Response): Promise<void>
  getRelatedProducts(req: Request, res: Response): Promise<void>
  getProductVariantForUser(req: Request, res: Response): Promise<void>
}
