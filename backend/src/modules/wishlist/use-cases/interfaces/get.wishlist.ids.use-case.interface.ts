export interface IGetWishlistIdsUseCase {
  execute(guestId: string): Promise<string[]>;
}
