import { z } from "zod";

export const GetAllQuerySchema = z.object({
  search: z.string().optional().default(""),
  page: z.coerce.number().min(1).default(1),
  // Capped so a public, unauthenticated listing endpoint (e.g. GET
  // /products) can't be asked for the entire catalog in one request - 100
  // matches the largest page-size option the admin UI itself ever requests.
  limit: z.coerce.number().min(1).max(100).default(4),
  sortValue: z.string().optional().default("createdAt"),
  filters: z.record(z.string(), z.any()).default({}),
  // Plain YYYY-MM-DD strings from a native <input type="date"> - only the
  // orders list use-case reads these today, everything else that shares
  // this schema just ignores them.
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type GetAllQueryDto = z.infer<typeof GetAllQuerySchema>;


