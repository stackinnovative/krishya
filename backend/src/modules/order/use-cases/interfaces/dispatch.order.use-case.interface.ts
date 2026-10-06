export interface IDispatchOrderUseCase {
    execute(orderId: string): Promise<void>;
}   