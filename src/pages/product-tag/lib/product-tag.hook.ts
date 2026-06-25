import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTags } from "./product-tag.actions";
import { PRODUCT_TAG } from "./product-tag.interface";
import { useProductTagStore } from "./product-tag.store";

export function useProductTag(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [PRODUCT_TAG.QUERY_KEY, params],
    queryFn: () => getTags({ params }),
    refetchOnWindowFocus: false,
  });
}

export function useProductTagById(id: number) {
  const { tag, isFinding, error, fetchTag } = useProductTagStore();

  useEffect(() => {
    fetchTag(id);
  }, [id]);

  return {
    data: tag,
    isFinding,
    error,
    refetch: () => fetchTag(id),
  };
}

export function useAllProductTags() {
  const { allTags, isLoadingAll, error, fetchAllTags } = useProductTagStore();

  useEffect(() => {
    if (!allTags) fetchAllTags();
  }, [allTags, fetchAllTags]);

  return {
    data: allTags,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllTags,
  };
}
