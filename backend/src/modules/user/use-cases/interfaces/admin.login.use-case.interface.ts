import type { LoginRequestDto } from "../../dtos/login.request.dto.js";
import type { LoginResponseDto } from "../../dtos/login.response.dto.js";


export interface IAdminLoginUseCase {
    execute(dto: LoginRequestDto): Promise<{
    userData: LoginResponseDto;
    accessToken: string;
    refreshToken: string;
  }>
}