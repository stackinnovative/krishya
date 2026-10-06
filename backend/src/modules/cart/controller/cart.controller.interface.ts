import type { Request, Response } from 'express';

export interface ICartController {
  addToCart(req: Request, res: Response): Promise<void>;
  getCart(req: Request, res: Response): Promise<void>;
  removeCartItem(req: Request, res: Response): Promise<void>;
  updateCartCount(req: Request, res: Response): Promise<void>;
  getCheckoutItem(req: Request, res: Response): Promise<void>;
  getCartItemsCount(req: Request, res: Response): Promise<void>;
}