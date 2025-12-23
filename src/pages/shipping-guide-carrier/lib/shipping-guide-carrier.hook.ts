import { useEffect } from "react";
import { useShippingGuideCarrierStore } from "./shipping-guide-carrier.store";
import type { GetShippingGuideCarriersParams } from "./shipping-guide-carrier.actions";

// ============================================
// SHIPPING GUIDE CARRIER HOOKS
// ============================================

export function useShippingGuideCarriers(params?: GetShippingGuideCarriersParams) {
  const { guides, meta, isLoading, error, fetchGuides } =
    useShippingGuideCarrierStore();

  useEffect(() => {
    fetchGuides(params);
  }, [params?.page, params?.search, params?.per_page, fetchGuides]);

  return {
    data: guides,
    meta,
    isLoading,
    error,
    refetch: () => fetchGuides(params),
  };
}

export function useAllShippingGuideCarriers() {
  const { allGuides, isLoadingAll, error, fetchAllGuides } =
    useShippingGuideCarrierStore();

  useEffect(() => {
    if (!allGuides) fetchAllGuides();
  }, [allGuides, fetchAllGuides]);

  return {
    data: allGuides,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllGuides,
  };
}

export function useShippingGuideCarrierById(id: number) {
  const { guide, isFinding, error, fetchGuide } =
    useShippingGuideCarrierStore();

  useEffect(() => {
    fetchGuide(id);
  }, [id, fetchGuide]);

  return {
    data: guide,
    isFinding,
    error,
    refetch: () => fetchGuide(id),
  };
}
