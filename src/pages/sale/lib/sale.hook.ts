import { useEffect } from "react";
import { useSaleStore } from "./sales.store";
import { getSales, type GetSalesParams } from "./sale.actions";
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
