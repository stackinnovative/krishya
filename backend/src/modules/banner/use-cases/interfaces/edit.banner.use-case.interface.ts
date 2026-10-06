import type { EditBannerRequestDto } from "../../dtos/banner.dto.js";

export interface IEditBannerUseCase {
    execute(id: string, dto: EditBannerRequestDto): Promise<void>;
}
