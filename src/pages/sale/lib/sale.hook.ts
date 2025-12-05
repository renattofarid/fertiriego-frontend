import { useEffect } from "react";
import { useSaleStore } from "./sales.store";
import type { GetSalesParams } from "./sale.actions";
import type { SaleResource } from "./sale.interface";
import type { Meta } from "@/lib/pagination.interface";

// ============================================
// SALE HOOKS
// ============================================

/**
 * Hook to fetch sales with pagination and filters
 */
export const useSale = (params?: GetSalesParams) => {
  const { sales, meta, isLoading, error, fetchSales } = useSaleStore();

  useEffect(() => {
    fetchSales(params);
  }, []);

  const refetch = async (newParams?: GetSalesParams) => {
    await fetchSales(newParams || params);
  };

  return {
    data: sales as SaleResource[] | null,
    meta: meta as Meta,
    isLoading,
    error,
    refetch,
  };
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
