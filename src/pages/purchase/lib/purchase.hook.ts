import { useEffect } from "react";
import { usePurchaseStore } from "./purchase.store";
import { getPurchases } from "./purchase.actions";
import { useQuery } from "@tanstack/react-query";
import { PURCHASE, type PurchaseResource } from "./purchase.interface";

// ============================================
// PURCHASE HOOKS
// ============================================

export function usePurchases(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [PURCHASE.QUERY_KEY, params],
    queryFn: () => getPurchases({ params }),
  });
}

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
