import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";
import { validateObjectId } from "../../../core/utils/validate.object.id.helper.js";

import type { IFaqController } from "./faq.controller.interface.js";
import type { IGetFaqsAdminUseCase } from "../use-cases/interfaces/get.faqs.admin.use-case.interface.js";
import type { IGetFaqsUserUseCase } from "../use-cases/interfaces/get.faqs.user.use-case.interface.js";
import type { IGetHomeFaqsUseCase } from "../use-cases/interfaces/get.home.faqs.use-case.interface.js";
import type { ICreateFaqGroupUseCase } from "../use-cases/interfaces/create.faq.group.use-case.interface.js";
import type { IEditFaqGroupUseCase } from "../use-cases/interfaces/edit.faq.group.use-case.interface.js";
import type { IDeleteFaqGroupUseCase } from "../use-cases/interfaces/delete.faq.group.use-case.interface.js";
import type { IReorderFaqGroupsUseCase } from "../use-cases/interfaces/reorder.faq.groups.use-case.interface.js";
import type { ICreateFaqUseCase } from "../use-cases/interfaces/create.faq.use-case.interface.js";
import type { IEditFaqUseCase } from "../use-cases/interfaces/edit.faq.use-case.interface.js";
import type { IDeleteFaqUseCase } from "../use-cases/interfaces/delete.faq.use-case.interface.js";
import type { IReorderFaqsUseCase } from "../use-cases/interfaces/reorder.faqs.use-case.interface.js";
import { CreateFaqGroupSchema, CreateFaqSchema, EditFaqGroupSchema, EditFaqSchema, ReorderSchema } from "../dtos/faq.dto.js";

@injectable()
export class FaqController implements IFaqController {
    constructor(
        @inject("IGetFaqsAdminUseCase")
        private readonly _getFaqsAdminUseCase: IGetFaqsAdminUseCase,

        @inject("IGetFaqsUserUseCase")
        private readonly _getFaqsUserUseCase: IGetFaqsUserUseCase,

        @inject("IGetHomeFaqsUseCase")
        private readonly _getHomeFaqsUseCase: IGetHomeFaqsUseCase,

        @inject("ICreateFaqGroupUseCase")
        private readonly _createFaqGroupUseCase: ICreateFaqGroupUseCase,

        @inject("IEditFaqGroupUseCase")
        private readonly _editFaqGroupUseCase: IEditFaqGroupUseCase,

        @inject("IDeleteFaqGroupUseCase")
        private readonly _deleteFaqGroupUseCase: IDeleteFaqGroupUseCase,

        @inject("IReorderFaqGroupsUseCase")
        private readonly _reorderFaqGroupsUseCase: IReorderFaqGroupsUseCase,

        @inject("ICreateFaqUseCase")
        private readonly _createFaqUseCase: ICreateFaqUseCase,

        @inject("IEditFaqUseCase")
        private readonly _editFaqUseCase: IEditFaqUseCase,

        @inject("IDeleteFaqUseCase")
        private readonly _deleteFaqUseCase: IDeleteFaqUseCase,

        @inject("IReorderFaqsUseCase")
        private readonly _reorderFaqsUseCase: IReorderFaqsUseCase,
    ) { }

    async getFaqsForAdmin(req: Request, res: Response): Promise<void> {
        try {
            const data = await this._getFaqsAdminUseCase.execute();
            res.status(HttpStatusCode.OK).json({ success: true, message: ResponseMessages.FAQ_FETCHED_SUCCESSFULLY, data });
        } catch (error) {
            console.log("Error in getFaqsForAdmin:", error);
            handleError(res, error);
        }
    }

    async getFaqsForUser(req: Request, res: Response): Promise<void> {
        try {
            const data = await this._getFaqsUserUseCase.execute();
            res.status(HttpStatusCode.OK).json({ success: true, message: ResponseMessages.FAQ_FETCHED_SUCCESSFULLY, data });
        } catch (error) {
            console.log("Error in getFaqsForUser:", error);
            handleError(res, error);
        }
    }

    async getHomeFaqs(req: Request, res: Response): Promise<void> {
        try {
            const data = await this._getHomeFaqsUseCase.execute();
            res.status(HttpStatusCode.OK).json({ success: true, message: ResponseMessages.FAQ_FETCHED_SUCCESSFULLY, data });
        } catch (error) {
            console.log("Error in getHomeFaqs:", error);
            handleError(res, error);
        }
    }

    async createGroup(req: Request, res: Response): Promise<void> {
        try {
            const dto = CreateFaqGroupSchema.parse(req.body);
            await this._createFaqGroupUseCase.execute(dto);
            res.status(HttpStatusCode.CREATED).json({ success: true, message: ResponseMessages.FAQ_GROUP_CREATED });
        } catch (error) {
            console.log("Error in createGroup:", error);
            handleError(res, error);
        }
    }

    async editGroup(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);
            const dto = EditFaqGroupSchema.parse(req.body);
            await this._editFaqGroupUseCase.execute(id!, dto);
            res.status(HttpStatusCode.OK).json({ success: true, message: ResponseMessages.FAQ_GROUP_UPDATED });
        } catch (error) {
            console.log("Error in editGroup:", error);
            handleError(res, error);
        }
    }

    async deleteGroup(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);
            await this._deleteFaqGroupUseCase.execute(id!);
            res.status(HttpStatusCode.OK).json({ success: true, message: ResponseMessages.FAQ_GROUP_DELETED });
        } catch (error) {
            console.log("Error in deleteGroup:", error);
            handleError(res, error);
        }
    }

    async reorderGroups(req: Request, res: Response): Promise<void> {
        try {
            const dto = ReorderSchema.parse(req.body);
            await this._reorderFaqGroupsUseCase.execute(dto);
            res.status(HttpStatusCode.OK).json({ success: true, message: ResponseMessages.FAQ_GROUPS_REORDERED });
        } catch (error) {
            console.log("Error in reorderGroups:", error);
            handleError(res, error);
        }
    }

    async createFaq(req: Request, res: Response): Promise<void> {
        try {
            const dto = CreateFaqSchema.parse(req.body);
            await this._createFaqUseCase.execute(dto);
            res.status(HttpStatusCode.CREATED).json({ success: true, message: ResponseMessages.FAQ_CREATED });
        } catch (error) {
            console.log("Error in createFaq:", error);
            handleError(res, error);
        }
    }

    async editFaq(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);
            const dto = EditFaqSchema.parse(req.body);
            await this._editFaqUseCase.execute(id!, dto);
            res.status(HttpStatusCode.OK).json({ success: true, message: ResponseMessages.FAQ_UPDATED });
        } catch (error) {
            console.log("Error in editFaq:", error);
            handleError(res, error);
        }
    }

    async deleteFaq(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);
            await this._deleteFaqUseCase.execute(id!);
            res.status(HttpStatusCode.OK).json({ success: true, message: ResponseMessages.FAQ_DELETED });
        } catch (error) {
            console.log("Error in deleteFaq:", error);
            handleError(res, error);
        }
    }

    async reorderFaqs(req: Request, res: Response): Promise<void> {
        try {
            const { groupId } = req.params;
            validateObjectId(groupId);
            const dto = ReorderSchema.parse(req.body);
            await this._reorderFaqsUseCase.execute(groupId!, dto);
            res.status(HttpStatusCode.OK).json({ success: true, message: ResponseMessages.FAQ_REORDERED });
        } catch (error) {
            console.log("Error in reorderFaqs:", error);
            handleError(res, error);
        }
    }
}
