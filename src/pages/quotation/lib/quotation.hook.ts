import { useEffect } from "react";
import { useQuotationStore } from "./quotation.store";
import type { GetQuotationsParams } from "./quotation.actions";

export function useQuotation(params?: GetQuotationsParams) {
  const { quotations, meta, isLoading, error, fetchQuotations } =
    useQuotationStore();

  useEffect(() => {
    if (!quotations) fetchQuotations(params);
  }, [quotations, fetchQuotations]);

  return {
    data: quotations,
    meta,
    isLoading,
    error,
    refetch: fetchQuotations,
  };
}

export function useAllQuotations() {
  const { allQuotations, isLoadingAll, error, fetchAllQuotations } =
    useQuotationStore();

  useEffect(() => {
    if (!allQuotations) fetchAllQuotations();
  }, [allQuotations, fetchAllQuotations]);

  return {
    data: allQuotations,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllQuotations,
  };
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
