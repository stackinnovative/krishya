export interface ITokenPayload {
  id: string;
  role: string;
}

export interface IRefreshTokenPayload {
  id: string;
  role: string;
  tokenVersion: number
}

export abstract class ITokenService {
  abstract signAccessToken(payload: ITokenPayload): Promise<string>;
  abstract signRefreshToken(payload: IRefreshTokenPayload): Promise<string>;
  abstract verifyAccessToken(token: string): Promise<ITokenPayload>;
  abstract verifyRefreshToken(token: string): Promise<IRefreshTokenPayload>;
}