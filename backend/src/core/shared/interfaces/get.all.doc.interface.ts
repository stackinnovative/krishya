export interface IGetAllDocDB {
    query: Record<string, any>;
    page: number;
    limit: number;
    sort: Record<string, any>;
}

