import { useEffect } from "react";
import { useGuideStore } from "./guide.store";
import type { GetGuidesParams } from "./guide.actions";

// ============================================
// GUIDE HOOKS
// ============================================

export function useGuides(params?: GetGuidesParams) {
  const { guides, meta, isLoading, error, fetchGuides } = useGuideStore();

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

export function useAllGuides() {
  const { allGuides, isLoadingAll, error, fetchAllGuides } = useGuideStore();

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

export function useGuideById(id: number) {
  const { guide, isFinding, error, fetchGuide } = useGuideStore();

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

// ============================================
// GUIDE MOTIVE HOOKS
// ============================================

export function useGuideMotives() {
  const { motives, isLoadingMotives, error, fetchMotives } = useGuideStore();

  useEffect(() => {
    if (!motives) fetchMotives();
  }, [motives, fetchMotives]);

  return {
    data: motives,
    isLoading: isLoadingMotives,
    error,
    refetch: fetchMotives,
  };
}
