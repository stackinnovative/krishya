import type { ToggleWishlistRequestDto } from "../../dtos/toggle.wishlist.dto.js";

export interface IToggleWishlistUseCase {
  execute(dto: ToggleWishlistRequestDto): Promise<{ added: boolean }>;
}
