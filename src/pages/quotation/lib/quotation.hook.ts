import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useQuotationStore } from "./quotation.store";
import { getQuotations } from "./quotation.actions";
import { QUOTATION } from "./quotation.interface";

export function useQuotations(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUOTATION.QUERY_KEY, params],
    queryFn: () =>
      getQuotations({
        params: {
          ...params,
        },
      }),
  });
}

export function useQuotationById(id: number) {
  const { quotation, isFinding, error, fetchQuotation } = useQuotationStore();

  useEffect(() => {
    fetchQuotation(id);
  }, [id]);

  return {
    data: quotation,
    isFinding,
    error,
    refetch: () => fetchQuotation(id),
  };
}
