import { useQuery } from "@tanstack/react-query";
import { getHomeFaqsApi } from "../api/faq.api";
import { faqKeys } from "@/shared/query-keys";

/** The questions picked for the home page (or the first few, if none are picked). */
export const useHomeFaqs = () => useQuery({ queryKey: faqKeys.home, queryFn: getHomeFaqsApi });
