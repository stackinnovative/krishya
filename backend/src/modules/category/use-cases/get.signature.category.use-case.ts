import type { IGetSignatureCategoryUseCase } from "./interfaces/get.signature.category.use-case.interface.js";
import type { CategoryUserView } from "../types/category.type.js";
import type { ICategoryRepository } from "../repositories/category.repository.interface.js";
import { inject, injectable } from "tsyringe";


@injectable()
export class GetSignatureCategoryUseCase implements IGetSignatureCategoryUseCase {
    constructor(
        @inject("ICategoryRepository")
        private readonly categoryRepository: ICategoryRepository,
    ) { }

    async execute(): Promise<CategoryUserView[]> {
        return await this.categoryRepository.findSignatureCategories();
    }
}