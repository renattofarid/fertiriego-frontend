import { useEffect } from "react";
import { useCategoryStore } from "./category.store";

export function useCategory(params?: Record<string, any>) {
  const { categories, meta, isLoading, error, fetchCategories } =
    useCategoryStore();

  useEffect(() => {
    if (!categories) fetchCategories(params);
  }, [categories, fetchCategories]);

  return {
    data: categories,
    meta,
    isLoading,
    error,
    refetch: fetchCategories,
  };
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