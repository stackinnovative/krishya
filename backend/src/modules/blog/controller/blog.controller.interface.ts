import type { Request, Response } from "express";

export interface IBlogController {
    createBlog(req: Request, res: Response): Promise<void>;
    editBlog(req: Request, res: Response): Promise<void>;
    deleteBlog(req: Request, res: Response): Promise<void>;
    restoreBlog(req: Request, res: Response): Promise<void>;
    publishBlog(req: Request, res: Response): Promise<void>;
    unpublishBlog(req: Request, res: Response): Promise<void>;
    getBlogForAdmin(req: Request, res: Response): Promise<void>;
    getAllBlogsForAdmin(req: Request, res: Response): Promise<void>;
    getAllBlogsForUser(req: Request, res: Response): Promise<void>;
    getFeaturedBlog(req: Request, res: Response): Promise<void>;
    getBlogBySlug(req: Request, res: Response): Promise<void>;
}
