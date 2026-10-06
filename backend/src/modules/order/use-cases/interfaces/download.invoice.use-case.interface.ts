
export interface IDownloadInvoiceUseCase {
    execute(orderId: string, guestId: string): Promise<Buffer>;
}   