import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";

import type { IProductController } from "./product.controller.interface.js";

import type { ICreateProductUseCase } from "../use-cases/interfaces/create.product.use-case.interface.js";
import type { IBlockProductUseCase } from "../use-cases/interfaces/block.product.use-case.interface.js";
import type { IUnblockProductUseCase } from "../use-cases/interfaces/unblock.product.use-case.interface.js";

import {
  CreateProductSchema,
  type CreateProductRequestDto,
} from "../dtos/create.product.dto.js";

import { GetAllQuerySchema } from "../../../core/shared/dtos/get.all.doc.dto.js";
import { validateObjectId } from "../../../core/utils/validate.object.id.helper.js";
import { parseReq } from "../../../core/utils/parse.query.helper.js";
import type { IEditProductUseCase } from "../use-cases/interfaces/edit.product.use-case.interface.js";
import type { IGetAllProductForAdminUseCase } from "../use-cases/interfaces/get.all.product.admin.use-case.interface.js";
import {
  UpdateVariantSchema,
  VariantArraySchema,
} from "../dtos/variant.dto.js";
import type { IAddProductVariantUseCase } from "../use-cases/interfaces/add.product.variant.use-case.interface.js";
import type { IEditProductVariantUseCase } from "../use-cases/interfaces/edit.product.variant.use-case.interface.js";
import {
  EditProductSchema,
  type EditProductRequestDto,
} from "../dtos/edit.product.dto.js";
import type { IGetProductDetailsForAdminUseCase } from "../use-cases/interfaces/get.product.admin.use-case.interface.js";
import type { IGetProductVariantForAdmin } from "../use-cases/interfaces/get.product.variant.for.admin.interface.js";
import type { IGetFeaturedProductUseCase } from "../use-cases/interfaces/get.fetured.product.use-case.interface.js";
import console from "console";
import type { IGetAllProductForUserUseCase } from "../use-cases/interfaces/get.all.product.user.use-case.interface.js";
import type { IGetProductForUserUseCase } from "../use-cases/interfaces/get.product.user.use-case.interface.js";
import type { IGetRelatedProductUseCase } from "../use-cases/interfaces/get.related.product.use-case.interface.js";
import type { IGetProductVariantForUserUseCase } from "../use-cases/interfaces/get.product.variant.for.user.use-case.interface.js";
import type { IAddColorOptionUseCase } from "../use-cases/interfaces/add.color.option.use-case.interface.js";
import type { IEditColorOptionUseCase } from "../use-cases/interfaces/edit.color.option.use-case.interface.js";
import { ColorOptionSchema, EditColorOptionSchema } from "../dtos/color.option.dto.js";

@injectable()
export class ProductController implements IProductController {
  constructor(
    @inject("ICreateProductUseCase")
    private readonly _createProductUseCase: ICreateProductUseCase,

    @inject("IEditProductUseCase")
    private readonly _editProductUseCase: IEditProductUseCase,

    @inject("IBlockProductUseCase")
    private readonly _blockProductUseCase: IBlockProductUseCase,

    @inject("IUnblockProductUseCase")
    private readonly _unblockProductUseCase: IUnblockProductUseCase,

    @inject("IGetAllProductForAdminUseCase")
    private readonly _getAllProductForAdminUseCase: IGetAllProductForAdminUseCase,

    @inject("IAddProductVariantUseCase")
    private readonly _addProductVariantUseCase: IAddProductVariantUseCase,

    @inject("IEditProductVariantUseCase")
    private readonly _editProductVariantUseCase: IEditProductVariantUseCase,

    @inject("IGetProductDetailsForAdminUseCase")
    private readonly _getProductDetailsForAdminUseCase: IGetProductDetailsForAdminUseCase,

    @inject("IGetProductVariantForAdmin")
    private readonly _getProductVariantForAdminUseCase: IGetProductVariantForAdmin,

    @inject("IGetFeaturedProductUseCase")
    private readonly _getFeaturedProductUseCase: IGetFeaturedProductUseCase,

    @inject("IGetAllProductForUserUseCase")
    private readonly _getAllProductForUserUseCase: IGetAllProductForUserUseCase,

    @inject("IGetProductForUserUseCase")
    private readonly _getProductForUserUseCase: IGetProductForUserUseCase,

    @inject("IGetRelatedProductUseCase")
    private readonly _getRelatedProductUseCase: IGetRelatedProductUseCase,

    @inject("IGetProductVariantForUserUseCase")
    private readonly _getProductVariantForUserUseCase: IGetProductVariantForUserUseCase,

    @inject("IAddColorOptionUseCase")
    private readonly _addColorOptionUseCase: IAddColorOptionUseCase,

    @inject("IEditColorOptionUseCase")
    private readonly _editColorOptionUseCase: IEditColorOptionUseCase,

  ) {}

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateProductRequestDto = CreateProductSchema.parse(req.body);

      await this._createProductUseCase.execute(dto);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: ResponseMessages.PRODUCT_CREATED_SUCCESS,
      });
    } catch (error) {
      console.log("Error in createProduct:", error);
      handleError(res, error);
    }
  }

  async editProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      validateObjectId(id);

      const dto: EditProductRequestDto = EditProductSchema.parse(req.body);

      await this._editProductUseCase.execute(id!, dto);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.PRODUCT_UPDATED_SUCCESS,
      });
    } catch (error) {
      console.log("Error in editProduct:", error);
      handleError(res, error);
    }
  }

  async blockProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      validateObjectId(id);

      await this._blockProductUseCase.execute(id!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.PRODUCT_STATUS_UPDATED_SUCCESS,
      });
    } catch (error) {
      console.log("Error in blockProduct:", error);
      handleError(res, error);
    }
  }

  async unblockProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      validateObjectId(id);

      await this._unblockProductUseCase.execute(id!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.PRODUCT_STATUS_UPDATED_SUCCESS,
      });
    } catch (error) {
      console.log("Error in unblockProduct:", error);
      handleError(res, error);
    }
  }

  async getAllProductForAdmin(req: Request, res: Response): Promise<void> {
    try {
      const dto = GetAllQuerySchema.parse(
        parseReq(req, ["isActive", "categoryId", "isFeatured"]),
      );

      const { data, total } =
        await this._getAllProductForAdminUseCase.execute(dto);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data,
        total,
        totalPages: Math.ceil(total / dto.limit),
      });
    } catch (error) {
      console.log("Error in get products for admin:", error);
      handleError(res, error);
    }
  }

  async addVariant(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      validateObjectId(productId);
      const dto = VariantArraySchema.parse(req.body);

      await this._addProductVariantUseCase.execute(productId!, dto);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.VARIANT_ADD_SUCCESS,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in add variant controller ", error);
    }
  }

  async editVariant(req: Request, res: Response): Promise<void> {
    try {
      const { productId, variantId } = req.params;
      validateObjectId(variantId);
      validateObjectId(productId);
      const dto = UpdateVariantSchema.parse(req.body);
      await this._editProductVariantUseCase.execute(
        productId!,
        variantId!,
        dto,
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.VARIANT_EDIT_SUCCESS,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in variant controller ", error);
    }
  }

  async getProductDetailsForAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      validateObjectId(id);
      const data = await this._getProductDetailsForAdminUseCase.execute(id!);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get product details for admin controller ", error);
    }
  }

  async getAdminProductVariant(req: Request, res: Response): Promise<void> {
    try {
      const { productId, variantId } = req.params;
      validateObjectId(variantId);
      validateObjectId(productId);
      const data = await this._getProductVariantForAdminUseCase.execute(
        productId!,
        variantId!,
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get product variant for admin controller ", error);
    }
  }

  async getFeaturedProducts(req: Request, res: Response): Promise<void> {
    try {
      const data = await this._getFeaturedProductUseCase.execute();
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get featured products controller ", error);
    }
  }

  async getAllProductForUser(req: Request, res: Response): Promise<void> {
    try {
      const dto = GetAllQuerySchema.parse(
        parseReq(req, ["categoryId"]),
      );

      const result = await this._getAllProductForUserUseCase.execute(dto);
   
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        ...result,
      });
    } catch (error) {
      console.log("Error in get products for user:", error);
      handleError(res, error);
    }
  }

  async getProductDetailsForUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      validateObjectId(id);
      const data = await this._getProductForUserUseCase.execute(id!);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get product details for user controller ", error);
    }
  }

  async getRelatedProducts(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const excludeProductId = req.query.excludeProductId as string | undefined;
      validateObjectId(categoryId);
      const data = await this._getRelatedProductUseCase.execute(categoryId!, excludeProductId);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get related products controller ", error);
    }
  }

  async getProductVariantForUser(req: Request, res: Response): Promise<void> {
    try {
      const { productId, variantId } = req.params;
      validateObjectId(variantId);
      validateObjectId(productId);

      const data = await this._getProductVariantForUserUseCase.execute(
        productId!,
        variantId!,
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get product variant for user controller ", error);
    }
  }

  async addColorOption(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      validateObjectId(productId);
      const dto = ColorOptionSchema.parse(req.body);

      await this._addColorOptionUseCase.execute(productId!, dto);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: ResponseMessages.COLOR_OPTION_ADD_SUCCESS,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in add color option controller ", error);
    }
  }

  async editColorOption(req: Request, res: Response): Promise<void> {
    try {
      const { productId, colorOptionId } = req.params;
      validateObjectId(productId);
      validateObjectId(colorOptionId);
      const dto = EditColorOptionSchema.parse(req.body);

      await this._editColorOptionUseCase.execute(productId!, colorOptionId!, dto);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.COLOR_OPTION_EDIT_SUCCESS,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in edit color option controller ", error);
    }
  }
}
