import { z } from "zod";



export const RevenueRangeSchema = z.enum([
  "Year",
  "Month",
  "Week",
  "Daily",
]);


export const GetRevenueQuerySchema = z
  .object({
    range: RevenueRangeSchema,
  })
  .strict();

/* ---------- DTO Type ---------- */

export type GetRevenueQueryDto = z.infer<
  typeof GetRevenueQuerySchema
>;