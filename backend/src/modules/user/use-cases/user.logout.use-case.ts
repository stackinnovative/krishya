import { inject, injectable } from "tsyringe";
import type { IUserLogoutUseCase } from "./interfaces/user.logout.use-case.interface.js";
import type { ITokenService } from "../../../core/ports/token.service.interface.js";
import type { IUserRepository } from "../repositories/user.repository.interface.js";

/**
 * Revokes the refresh token server-side by bumping the user's tokenVersion -
 * clearing the cookie alone leaves a copied refresh token usable until it
 * expires. Every refresh token issued before this point stops working (so
 * this also signs the user out on their other devices).
 */
@injectable()
export class UserLogoutUseCase implements IUserLogoutUseCase {
  constructor(
    @inject("ITokenService")
    private readonly _tokenService: ITokenService,

    @inject("IUserRepository")
    private readonly _userRepository: IUserRepository
  ) { }

  async execute(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;

    let decoded: { id: string; tokenVersion: number };
    try {
      decoded = (await this._tokenService.verifyRefreshToken(refreshToken)) as { id: string; tokenVersion: number };
    } catch {
      // Expired or tampered - it can't be used to refresh anyway, so there is nothing to revoke.
      return;
    }

    const user = await this._userRepository.findById(decoded.id);
    if (!user || user.tokenVersion !== decoded.tokenVersion) return;

    await this._userRepository.save(user.incrementTokenVersion());
  }
}
