import type { IdName } from "../../../../core/shared/types/id.name.type.js";

export interface IGetAllActiveCategoryUseCase {
  execute(): Promise<IdName[]>;
}
