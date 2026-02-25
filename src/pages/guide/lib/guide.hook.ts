import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useGuideStore } from "./guide.store";
import { getGuides, type GetGuidesParams } from "./guide.actions";
import { GUIDE } from "./guide.interface";

// ============================================
// GUIDE HOOKS
// ============================================

const { QUERY_KEY } = GUIDE;

export function useGuides(params?: GetGuidesParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getGuides(params),
  });
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
