import { useQuery } from "@tanstack/react-query";
import type { GetQuotationsParams } from "./quotation.actions";
import { getQuotations, getAllQuotations } from "./quotation.actions";
import { QUOTATION_QUERY_KEY } from "./quotation.interface";

export const useQuotation = (params?: GetQuotationsParams) => {
  return useQuery({
    queryKey: [QUOTATION_QUERY_KEY, params],
    queryFn: () => getQuotations(params),
    select: (data) => data.data,
  });
};

export const useAllQuotations = () => {
  return useQuery({
    queryKey: [QUOTATION_QUERY_KEY, "all"],
    queryFn: getAllQuotations,
  });
};
