export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export interface GetAllDocResponse<T = unknown> {
  success: boolean;
  message: string;
  total: number;
  currentPage: number;
  totalPages: number;
  data?: T;
  errors?: unknown;
}

export type IdName = {
  id: string;
  name: string;
};

export type GetIdNameResponse = ApiResponse<IdName[]>;
