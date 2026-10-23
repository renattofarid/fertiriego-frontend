import { useEffect } from "react";
import { useSaleStore } from "./sales.store";
import {
  findSaleById,
  getSales,
  getSalesForCreditNote,
  type GetSalesParams,
} from "./sale.actions";
import { SALE, type SaleResource } from "./sale.interface";
import { useQuery } from "@tanstack/react-query";

const { QUERY_KEY } = SALE;

/**
 * Hook to fetch sales with pagination and filters
 */
export const useSale = (params?: GetSalesParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getSales(params),
  });
};

/**
 * Hook to fetch sales for the credit note selector (/saleCredit)
 */
export const useSalesForCreditNote = (params?: GetSalesParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, "credit-note", params],
    queryFn: () => getSalesForCreditNote(params),
  });
};

/**
 * Hook to fetch one sale directly by ID (evita paginar al precargar un select)
 */
export const useSaleByIdForSelect = (id: string) => {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY, "by-id", id],
    queryFn: () => findSaleById(Number(id)),
    enabled: !!id && Number(id) > 0,
  });
  return { data, isLoading };
};

/**
 * Hook to fetch all sales (no pagination)
 */
export const useAllSales = () => {
  const { allSales, isLoadingAll, error, fetchAllSales } = useSaleStore();

  useEffect(() => {
    fetchAllSales();
  }, []);

  const refetch = async () => {
    await fetchAllSales();
  };

  return {
    data: allSales as SaleResource[] | null,
    isLoading: isLoadingAll,
    error,
    refetch,
  };
};

/**
 * Hook to fetch a single sale by ID
 */
export const useSaleById = (id: number) => {
  const { sale, isFinding, error, fetchSale } = useSaleStore();

  useEffect(() => {
    if (id) {
      fetchSale(id);
    }
  }, [id]);

  const refetch = async () => {
    if (id) {
      await fetchSale(id);
    }
  };

  return {
    data: sale as SaleResource | null,
    isFinding,
    error,
    refetch,
  };
};
