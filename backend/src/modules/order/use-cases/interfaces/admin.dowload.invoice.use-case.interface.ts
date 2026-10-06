export interface IAdminDownloadInvoiceUseCase {
    execute(orderId: string): Promise<Buffer>;
}