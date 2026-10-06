import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { IAdminUserController } from "./interfaces/admin.user.controller.interface.js";
import type { IGetAdminUsersUseCase } from "../use-cases/interfaces/get.admin.users.use-case.interface.js";
import type { IGetAdminUserDetailUseCase } from "../use-cases/interfaces/get.admin.user.detail.use-case.interface.js";
import type { ICreateAdminUserUseCase } from "../use-cases/interfaces/create.admin.user.use-case.interface.js";
import type { IUpdateAdminUserUseCase } from "../use-cases/interfaces/update.admin.user.use-case.interface.js";
import type { IBlockAdminUserUseCase } from "../use-cases/interfaces/block.admin.user.use-case.interface.js";
import type { IUnblockAdminUserUseCase } from "../use-cases/interfaces/unblock.admin.user.use-case.interface.js";
import { GetAllQuerySchema } from "../../../core/shared/dtos/get.all.doc.dto.js";
import { CreateAdminUserSchema } from "../dtos/create.admin.user.dto.js";
import { UpdateAdminUserSchema } from "../dtos/update.admin.user.dto.js";
import { parseReq } from "../../../core/utils/parse.query.helper.js";
import { validateObjectId } from "../../../core/utils/validate.object.id.helper.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";

@injectable()
export class AdminUserController implements IAdminUserController {
  constructor(
    @inject("IGetAdminUsersUseCase")
    private readonly _getAdminUsersUseCase: IGetAdminUsersUseCase,

    @inject("IGetAdminUserDetailUseCase")
    private readonly _getAdminUserDetailUseCase: IGetAdminUserDetailUseCase,

    @inject("ICreateAdminUserUseCase")
    private readonly _createAdminUserUseCase: ICreateAdminUserUseCase,

    @inject("IUpdateAdminUserUseCase")
    private readonly _updateAdminUserUseCase: IUpdateAdminUserUseCase,

    @inject("IBlockAdminUserUseCase")
    private readonly _blockAdminUserUseCase: IBlockAdminUserUseCase,

    @inject("IUnblockAdminUserUseCase")
    private readonly _unblockAdminUserUseCase: IUnblockAdminUserUseCase,
  ) { }

  async getAdminUsers(req: Request, res: Response): Promise<void> {
    try {
      const dto = GetAllQuerySchema.parse(parseReq(req, ["role", "isBlocked"]));
      const { data, total } = await this._getAdminUsersUseCase.execute(dto);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data,
        total,
        totalPages: Math.ceil(total / dto.limit),
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get admin users controller ", error);
    }
  }

  async getAdminUserDetail(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      validateObjectId(userId);
      const user = await this._getAdminUserDetailUseCase.execute(userId!);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: user,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get admin user detail controller ", error);
    }
  }

  async createAdminUser(req: Request, res: Response): Promise<void> {
    try {
      const dto = CreateAdminUserSchema.parse(req.body);
      const user = await this._createAdminUserUseCase.execute(dto);
      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: user,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in create admin user controller ", error);
    }
  }

  async updateAdminUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      validateObjectId(userId);
      const dto = UpdateAdminUserSchema.parse(req.body);
      const user = await this._updateAdminUserUseCase.execute(userId!, dto);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: user,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in update admin user controller ", error);
    }
  }

  async blockAdminUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      validateObjectId(userId);
      await this._blockAdminUserUseCase.execute(userId!);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.USER_STATUS_UPDATED_SUCCESS,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in block admin user controller ", error);
    }
  }

  async unblockAdminUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      validateObjectId(userId);
      await this._unblockAdminUserUseCase.execute(userId!);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.USER_STATUS_UPDATED_SUCCESS,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in unblock admin user controller ", error);
    }
  }
}
