import { z } from "zod";

export const RevenueReportQuerySchema = z
  .object({
    option: z.enum([
      "daily",
      "last_7_days",
      "this_week",
      "this_month",
      "last_month",
      "last_6_months",
      "this_year",
      "all_time",
      "custom",
    ]),
    customStartDate: z.string().optional().nullable(),
    customEndDate: z.string().optional().nullable(),
    // Overview (default) auto-picks bucket size (day/week/month) from the
    // range's span. The "detail" drill-down always wants day-level rows
    // regardless of span, paired with real page/limit pagination.
    detail: z.coerce.boolean().optional().default(false),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .refine((data) => {
  if (data.option !== "custom") return true;

  if (!data.customStartDate || !data.customEndDate) return false;

  const start = new Date(data.customStartDate);
  const end = new Date(data.customEndDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

  // Allow same day
  return start.getTime() <= end.getTime();
}, {
  message:
    "For custom option, valid start and end dates are required and start must be before or equal to end",
  path: ["customStartDate"],
});

export type RevenueReportQueryDto = z.infer<typeof RevenueReportQuerySchema>;
