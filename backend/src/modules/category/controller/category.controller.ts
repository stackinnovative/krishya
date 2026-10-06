import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";


import type { ICategoryController } from "./category.controller.interface.js";

import type { ICreateCategoryUseCase } from "../use-cases/interfaces/create.category.use-case.interface.js";
import type { IEditCategoryUseCase } from "../use-cases/interfaces/edit.category.use-case.interface.js";
import type { IBlockCategoryUseCase } from "../use-cases/interfaces/block.category.use-case.interface.js";
import type { IUnblockCategoryUseCase } from "../use-cases/interfaces/unblock.category.use-case.interface.js";
import type { IGetAllCategoryUseCase } from "../use-cases/interfaces/get.all.category.use-case.interface.js";
import type { IGetAllActiveCategoryUseCase } from "../use-cases/interfaces/get.all.active.category.use-case.interface.js";

import {
  CreateCategorySchema,
  type CreateCategoryRequestDto,
} from "../dtos/create.category.dto.js";
import { GetAllQuerySchema } from "../../../core/shared/dtos/get.all.doc.dto.js";
import { validateObjectId } from "../../../core/utils/validate.object.id.helper.js";
import { parseReq } from "../../../core/utils/parse.query.helper.js";
import type { IGetCategoryByIdUseCase } from "../use-cases/interfaces/get.category.by-id.use-case.interface.js";
import type { IGetSignatureCategoryUseCase } from "../use-cases/interfaces/get.signature.category.use-case.interface.js";

@injectable()
export class CategoryController implements ICategoryController {
  constructor(
    @inject("ICreateCategoryUseCase")
    private readonly _createCategoryUseCase: ICreateCategoryUseCase,

    @inject("IEditCategoryUseCase")
    private readonly _editCategoryUseCase: IEditCategoryUseCase,

    @inject("IBlockCategoryUseCase")
    private readonly _blockCategoryUseCase: IBlockCategoryUseCase,

    @inject("IUnblockCategoryUseCase")
    private readonly _unblockCategoryUseCase: IUnblockCategoryUseCase,

    @inject("IGetAllCategoryUseCase")
    private readonly _getAllCategoryUseCase: IGetAllCategoryUseCase,

    @inject("IGetAllActiveCategoryUseCase")
    private readonly _getAllActiveCategoryUseCase: IGetAllActiveCategoryUseCase,

    @inject("IGetCategoryByIdUseCase")
    private readonly _getCategoryByIdUseCase: IGetCategoryByIdUseCase,

    @inject("IGetSignatureCategoryUseCase")
    private readonly _getSignatureCategoryUseCase: IGetSignatureCategoryUseCase
  ) { }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateCategoryRequestDto =
        CreateCategorySchema.parse(req.body);

      await this._createCategoryUseCase.execute(dto);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: ResponseMessages.CATEGORY_CREATED_SUCCESS,
      });
    } catch (error) {
      console.log("Error in createCategory:", error);
      handleError(res, error);
    }
  }

  async editCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      validateObjectId(id);

      const dto: CreateCategoryRequestDto =
        CreateCategorySchema.parse(req.body);

      await this._editCategoryUseCase.execute(id!, dto);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.CATEGORY_UPDATED_SUCCESS,
      });
    } catch (error) {
      console.log("Error in editCategory:", error);
      handleError(res, error);
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      validateObjectId(id);

      const category = await this._getCategoryByIdUseCase.execute(id!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: category,
      });
    } catch (error) {
      console.log("Error in getCategoryById:", error);
      handleError(res, error);
    }
  }

  async blockCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      validateObjectId(id);

      await this._blockCategoryUseCase.execute(id!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.CATEGORY_STATUS_UPDATED_SUCCESS,
      });
    } catch (error) {
      console.log("Error in blockCategory:", error);
      handleError(res, error);
    }
  }

  async unblockCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      validateObjectId(id);

      await this._unblockCategoryUseCase.execute(id!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.CATEGORY_STATUS_UPDATED_SUCCESS,
      });
    } catch (error) {
      console.log("Error in unblockCategory:", error);
      handleError(res, error);
    }
  }

  async getAllCategoriesForAdmin(req: Request, res: Response): Promise<void> {
    try {

      const dto = GetAllQuerySchema.parse(parseReq(req, ["isActive"]));
      const { data, total } =
        await this._getAllCategoryUseCase.execute(dto);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data,
        total,
        totalPages: Math.ceil(total / dto.limit),
      });
    } catch (error) {
      console.log("Error in get categories for admin:", error);
      handleError(res, error);
    }
  }

  async getActiveCategoriesForUser(req: Request, res: Response): Promise<void> {
    try {
      const categories =
        await this._getAllActiveCategoryUseCase.execute();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: categories,
      });
    } catch (error) {
      console.log("Error in get active categories:", error);
      handleError(res, error);
    }
  }

  async getSignatureCategories(req: Request, res: Response): Promise<void> {
    try {

      const data =
        await this._getSignatureCategoryUseCase.execute();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data,
      });
    } catch (error) {
      console.log("Error in get signature categories:", error);
      handleError(res, error);
    }
  }
}
