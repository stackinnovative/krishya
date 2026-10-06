import { container } from "tsyringe";

/* ---------- repository ---------- */
import type { ICategoryRepository } from "../modules/category/repositories/category.repository.interface.js";
import { CategoryRepository } from "../modules/category/repositories/category.repository.js";

/* ---------- use cases ---------- */
import type { ICreateCategoryUseCase } from "../modules/category/use-cases/interfaces/create.category.use-case.interface.js";
import { CreateCategoryUseCase } from "../modules/category/use-cases/create.category.use-case.js";

import type { IEditCategoryUseCase } from "../modules/category/use-cases/interfaces/edit.category.use-case.interface.js";
import { EditCategoryUseCase } from "../modules/category/use-cases/edit.category.use-case.js";

import type { IBlockCategoryUseCase } from "../modules/category/use-cases/interfaces/block.category.use-case.interface.js";
import { BlockCategoryUseCase } from "../modules/category/use-cases/block.category.use-case.js";

import type { IUnblockCategoryUseCase } from "../modules/category/use-cases/interfaces/unblock.category.use-case.interface.js";
import { UnblockCategoryUseCase } from "../modules/category/use-cases/unblock.category.use-case.js";

import type { IGetAllCategoryUseCase } from "../modules/category/use-cases/interfaces/get.all.category.use-case.interface.js";
import { GetAllCategoryUseCase } from "../modules/category/use-cases/get.all.category.use-case.js";

import type { IGetCategoryByIdUseCase } from "../modules/category/use-cases/interfaces/get.category.by-id.use-case.interface.js";
import { GetCategoryByIdUseCase } from "../modules/category/use-cases/get.category.by-id.use-case.js";

import type { IGetAllActiveCategoryUseCase } from "../modules/category/use-cases/interfaces/get.all.active.category.use-case.interface.js";
import { GetAllActiveCategoryUseCase } from "../modules/category/use-cases/get.all.active.category.use-case.js";

import type { IGetSignatureCategoryUseCase } from "../modules/category/use-cases/interfaces/get.signature.category.use-case.interface.js";
import { GetSignatureCategoryUseCase } from "../modules/category/use-cases/get.signature.category.use-case.js";

export const registerCategoryDependencies = () => {
  /* ---------- repository ---------- */
  container.register<ICategoryRepository>("ICategoryRepository", {
    useClass: CategoryRepository,
  });

  /* ---------- use cases ---------- */
  container.register<ICreateCategoryUseCase>("ICreateCategoryUseCase", {
    useClass: CreateCategoryUseCase,
  });

  container.register<IEditCategoryUseCase>("IEditCategoryUseCase", {
    useClass: EditCategoryUseCase,
  });

  container.register<IBlockCategoryUseCase>("IBlockCategoryUseCase", {
    useClass: BlockCategoryUseCase,
  });

  container.register<IUnblockCategoryUseCase>("IUnblockCategoryUseCase", {
    useClass: UnblockCategoryUseCase,
  });

  container.register<IGetAllCategoryUseCase>("IGetAllCategoryUseCase", {
    useClass: GetAllCategoryUseCase,
  });

  container.register<IGetCategoryByIdUseCase>("IGetCategoryByIdUseCase", {
    useClass: GetCategoryByIdUseCase,
  });

  container.register<IGetAllActiveCategoryUseCase>(
    "IGetAllActiveCategoryUseCase",
    {
      useClass: GetAllActiveCategoryUseCase,
    }
  );

  container.register<IGetSignatureCategoryUseCase>("IGetSignatureCategoryUseCase", {
    useClass: GetSignatureCategoryUseCase,
  });
};
