import type { Request, Response } from "express";

export interface ITestimonialController {
    createTestimonial(req: Request, res: Response): Promise<void>;
    editTestimonial(req: Request, res: Response): Promise<void>;
    blockTestimonial(req: Request, res: Response): Promise<void>;
    unblockTestimonial(req: Request, res: Response): Promise<void>;
    getTestimonialsForAdmin(req: Request, res: Response): Promise<void>;
    getTestimonialsForUser(req: Request, res: Response): Promise<void>;
    getTestimonialById(req: Request, res: Response): Promise<void>;
    deleteTestimonial(req: Request, res: Response): Promise<void>;
}
