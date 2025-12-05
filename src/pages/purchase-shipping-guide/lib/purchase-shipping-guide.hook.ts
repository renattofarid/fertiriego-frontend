import { useEffect } from "react";
import { usePurchaseShippingGuideStore } from "./purchase-shipping-guide.store";
import type { GetPurchaseShippingGuidesParams } from "./purchase-shipping-guide.actions";
import type { PurchaseShippingGuideResource } from "./purchase-shipping-guide.interface";
import type { Meta } from "@/lib/pagination.interface";

// ============================================
// PURCHASE SHIPPING GUIDE HOOKS
// ============================================

/**
 * Hook to fetch purchase shipping guides with pagination and filters
 */
export const usePurchaseShippingGuide = (
  params?: GetPurchaseShippingGuidesParams
) => {
  const { guides, meta, isLoading, error, fetchGuides } =
    usePurchaseShippingGuideStore();

  useEffect(() => {
    fetchGuides(params);
  }, []);

  const refetch = async (newParams?: GetPurchaseShippingGuidesParams) => {
    await fetchGuides(newParams || params);
  };

  return {
    data: guides as PurchaseShippingGuideResource[] | null,
    meta: meta as Meta | null,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch all purchase shipping guides (no pagination)
 */
export const useAllPurchaseShippingGuides = () => {
  const { allGuides, isLoadingAll, error, fetchAllGuides } =
    usePurchaseShippingGuideStore();

  useEffect(() => {
    fetchAllGuides();
  }, []);

  const refetch = async () => {
    await fetchAllGuides();
  };

  return {
    data: allGuides as PurchaseShippingGuideResource[] | null,
    isLoading: isLoadingAll,
    error,
    refetch,
  };
};

/**
 * Hook to fetch a single purchase shipping guide by ID
 */
export const usePurchaseShippingGuideById = (id: number) => {
  const { guide, isFinding, error, fetchGuide } =
    usePurchaseShippingGuideStore();

  useEffect(() => {
    if (id) {
      fetchGuide(id);
    }
  }, [id]);

  const refetch = async () => {
    if (id) {
      await fetchGuide(id);
    }
  };

  return {
    data: guide as PurchaseShippingGuideResource | null,
    isFinding,
    error,
    refetch,
  };
};
