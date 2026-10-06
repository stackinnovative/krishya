export interface IDeliverOrderUseCase {
    execute(orderId: string): Promise<void>;
}