import type { CreateBannerRequestDto } from "../../dtos/banner.dto.js";

export interface ICreateBannerUseCase {
    execute(dto: CreateBannerRequestDto): Promise<void>;
}
