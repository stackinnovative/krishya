import type { Request } from "express";
import { buildFilters } from "./make.filter.helper.js";



export interface IParseResult {
  page: number;
  search: string;
  limit: number;
  sortValue: string;
  filters: Record<string, any>;
  dateFrom?: string;
  dateTo?: string;
}

export function parseReq(req: Request, filtersArr: string[]): IParseResult {
  const filters = buildFilters(filtersArr, req.query);
  return {
    page: req.query.page as any,
    search: req.query.search as any,
    limit: req.query.limit as any,
    sortValue: req.query.sort as any,
    filters,
    dateFrom: req.query.dateFrom as any,
    dateTo: req.query.dateTo as any,
  };
}
