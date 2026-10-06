import type { NextFunction, Response, Request } from "express";


export const authorizeRoles = (...allowedRoles: string[]) => {
  
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
       res.status(403).json({ message: 'Access denied' });
       return
    }
    next();
  };
};
