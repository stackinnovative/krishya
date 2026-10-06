export interface IGetCartItemsCountUseCase {
    execute(guestId: string): Promise<number>;
}