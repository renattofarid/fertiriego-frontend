import { useEffect } from "react";
import { useCategoryStore } from "./category.store";
import { getCategory } from "./category.actions";
import { useQuery } from "@tanstack/react-query";
import { CATEGORY } from "./category.interface";

export function useCategory(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [CATEGORY.QUERY_KEY, params],
    queryFn: () => getCategory({ params }),
    refetchOnWindowFocus: false,
  });
}

export function useAllCategories() {
  const { allCategories, isLoadingAll, error, fetchAllCategories } =
    useCategoryStore();

  useEffect(() => {
    if (!allCategories) fetchAllCategories();
  }, [allCategories, fetchAllCategories]);

  return {
    data: allCategories,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllCategories,
  };
}

export function useCategoryById(id: number) {
  const { category, isFinding, error, fetchCategory } = useCategoryStore();

  useEffect(() => {
    fetchCategory(id);
  }, [id]);

  return {
    data: category,
    isFinding,
    error,
    refetch: () => fetchCategory(id),
  };
}
