import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.type.js";


export interface IAuthenticate {
  authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
