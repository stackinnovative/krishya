import type { ApiResponse } from "@/shared/types/api.types";

export type SignatureCategory = { id: string; name: string; image: string };
export type GetSignatureCategoriesResponse = ApiResponse<SignatureCategory[]>;
