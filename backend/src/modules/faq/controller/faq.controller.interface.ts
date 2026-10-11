import type { Request, Response } from "express";

export interface IFaqController {
    getFaqsForAdmin(req: Request, res: Response): Promise<void>;
    getFaqsForUser(req: Request, res: Response): Promise<void>;
    getHomeFaqs(req: Request, res: Response): Promise<void>;
    createGroup(req: Request, res: Response): Promise<void>;
    editGroup(req: Request, res: Response): Promise<void>;
    deleteGroup(req: Request, res: Response): Promise<void>;
    reorderGroups(req: Request, res: Response): Promise<void>;
    createFaq(req: Request, res: Response): Promise<void>;
    editFaq(req: Request, res: Response): Promise<void>;
    deleteFaq(req: Request, res: Response): Promise<void>;
    reorderFaqs(req: Request, res: Response): Promise<void>;
}
