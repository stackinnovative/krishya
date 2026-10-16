import { container } from "tsyringe";

/* ---------- repository ---------- */
import type { IProductRepository } from "../modules/product/repositories/product.repository.interface.js";
import { ProductRepository } from "../modules/product/repositories/product.repository.js";

/* ---------- use cases ---------- */
import type { ICreateProductUseCase } from "../modules/product/use-cases/interfaces/create.product.use-case.interface.js";
import { CreateProductUseCase } from "../modules/product/use-cases/create.product.use-case.js";

import type { IEditProductUseCase } from "../modules/product/use-cases/interfaces/edit.product.use-case.interface.js";
import { EditProductUseCase } from "../modules/product/use-cases/edit.product.use-case.js";

import type { IBlockProductUseCase } from "../modules/product/use-cases/interfaces/block.product.use-case.interface.js";
import { BlockProductUseCase } from "../modules/product/use-cases/block.product.use-case.js";

import type { IUnblockProductUseCase } from "../modules/product/use-cases/interfaces/unblock.product.use-case.interface.js";
import { UnblockProductUseCase } from "../modules/product/use-cases/unblock.product.use-case.js";

import type { IGetAllProductForAdminUseCase } from "../modules/product/use-cases/interfaces/get.all.product.admin.use-case.interface.js";
import { GetAllProductForAdminUseCase } from "../modules/product/use-cases/get.all.product.admin.use-case.js";

import type { IGetProductDetailsForAdminUseCase } from "../modules/product/use-cases/interfaces/get.product.admin.use-case.interface.js";
import { GetProductDetailsForAdminUseCase } from "../modules/product/use-cases/get.product.admin.use-case.js";

import type { IGetProductForUserUseCase } from "../modules/product/use-cases/interfaces/get.product.user.use-case.interface.js";
import { GetProductForUserUseCase } from "../modules/product/use-cases/get.product.user.use-case.js";
import type { IAddProductVariantUseCase } from "../modules/product/use-cases/interfaces/add.product.variant.use-case.interface.js";
import { AddProductVariantUseCase } from "../modules/product/use-cases/add.product.variant.use-case.js";
import type { IEditProductVariantUseCase } from "../modules/product/use-cases/interfaces/edit.product.variant.use-case.interface.js";
import { EditProductVariantUseCase } from "../modules/product/use-cases/edit.product.variant.use-case.js";
import type { IGetProductVariantForAdmin } from "../modules/product/use-cases/interfaces/get.product.variant.for.admin.interface.js";
import { GetProductVariantForAdmin } from "../modules/product/use-cases/get.product.variant.for.admin.js";
import type { IGetFeaturedProductUseCase } from "../modules/product/use-cases/interfaces/get.fetured.product.use-case.interface.js";
import { GetFeaturedProductUseCase } from "../modules/product/use-cases/get.fetured.product.use-case.js";
import type { IGetAllProductForUserUseCase } from "../modules/product/use-cases/interfaces/get.all.product.user.use-case.interface.js";
import { GetAllProductForUserUseCase } from "../modules/product/use-cases/get.all.product.user.use-case.js";
import type { IGetRelatedProductUseCase } from "../modules/product/use-cases/interfaces/get.related.product.use-case.interface.js";
import { GetRelatedProductUseCase } from "../modules/product/use-cases/get.related.product.use-case.js";
import type { IGetProductVariantForUserUseCase } from "../modules/product/use-cases/interfaces/get.product.variant.for.user.use-case.interface.js";
import { GetProductVariantForUserUseCase } from "../modules/product/use-cases/get.product.variant.for.user.use-case.js";

export const registerProductDependencies = () => {
  /* ---------- repository ---------- */
  container.register<IProductRepository>("IProductRepository", {
    useClass: ProductRepository,
  });

  /* ---------- use cases ---------- */
  container.register<ICreateProductUseCase>("ICreateProductUseCase", {
    useClass: CreateProductUseCase,
  });

  container.register<IEditProductUseCase>("IEditProductUseCase", {
    useClass: EditProductUseCase,
  });

  container.register<IBlockProductUseCase>("IBlockProductUseCase", {
    useClass: BlockProductUseCase,
  });

  container.register<IUnblockProductUseCase>("IUnblockProductUseCase", {
    useClass: UnblockProductUseCase,
  });

  container.register<IGetAllProductForAdminUseCase>(
    "IGetAllProductForAdminUseCase",
    {
      useClass: GetAllProductForAdminUseCase,
    }
  );

  container.register<IGetProductDetailsForAdminUseCase>(
    "IGetProductDetailsForAdminUseCase",
    {
      useClass: GetProductDetailsForAdminUseCase,
    }
  );

  container.register<IGetProductForUserUseCase>(
    "IGetProductForUserUseCase",
    {
      useClass: GetProductForUserUseCase,
    }
  );

  container.register<IAddProductVariantUseCase>(
    "IAddProductVariantUseCase", { useClass: AddProductVariantUseCase }
  )

  container.register<IEditProductVariantUseCase>(
    "IEditProductVariantUseCase", { useClass: EditProductVariantUseCase }
  )

  container.register<IGetProductVariantForAdmin>(
    "IGetProductVariantForAdmin", { useClass: GetProductVariantForAdmin }
  )

  container.register<IGetFeaturedProductUseCase>(
    "IGetFeaturedProductUseCase", { useClass: GetFeaturedProductUseCase }
  )

  container.register<IGetAllProductForUserUseCase>(
    "IGetAllProductForUserUseCase", { useClass: GetAllProductForUserUseCase }
  )

  container.register<IGetProductVariantForUserUseCase>(
    "IGetProductVariantForUserUseCase", { useClass: GetProductVariantForUserUseCase }
  )

  container.register<IGetRelatedProductUseCase>(
    "IGetRelatedProductUseCase", { useClass: GetRelatedProductUseCase }
  )
};
