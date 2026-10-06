import { useQuery } from "@tanstack/react-query";
import { getActiveCategoriesApi } from "../api/category.api";
import { categoryKeys } from "@/shared/query-keys";

export const useActiveCategories = () =>
  useQuery({ queryKey: categoryKeys.active, queryFn: getActiveCategoriesApi });
