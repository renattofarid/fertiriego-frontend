import { useEffect } from "react";
import { usePurchaseStore } from "./purchase.store";
import type { GetPurchasesParams } from "./purchase.actions";
import type { PurchaseResource } from "./purchase.interface";
import type { Meta } from "@/lib/pagination.interface";

// ============================================
// PURCHASE HOOKS
// ============================================

/**
 * Hook to fetch purchases with pagination and filters
 */
export const usePurchase = (params?: GetPurchasesParams) => {
  const { purchases, meta, isLoading, error, fetchPurchases } =
    usePurchaseStore();

  useEffect(() => {
    fetchPurchases(params);
  }, []);

  const refetch = async (newParams?: GetPurchasesParams) => {
    await fetchPurchases(newParams || params);
  };

  return {
    data: purchases as PurchaseResource[] | null,
    meta: meta as Meta | null,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch all purchases (no pagination)
 */
export const useAllPurchases = () => {
  const { allPurchases, isLoadingAll, error, fetchAllPurchases } =
    usePurchaseStore();

  useEffect(() => {
    fetchAllPurchases();
  }, []);

  const refetch = async () => {
    await fetchAllPurchases();
  };

  return {
    data: allPurchases as PurchaseResource[] | null,
    isLoading: isLoadingAll,
    error,
    refetch,
  };
};

/**
 * Hook to fetch a single purchase by ID
 */
export const usePurchaseById = (id: number) => {
  const { purchase, isFinding, error, fetchPurchase } = usePurchaseStore();

  useEffect(() => {
    if (id) {
      fetchPurchase(id);
    }
  }, [id]);

  const refetch = async () => {
    if (id) {
      await fetchPurchase(id);
    }
  };

  return {
    data: purchase as PurchaseResource | null,
    isFinding,
    error,
    refetch,
  };
};
