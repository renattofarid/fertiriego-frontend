import { useEffect } from "react";
import { useProductPriceCategoryStore } from "./product-price-category.store";

export function useProductPriceCategory(params?: Record<string, unknown>) {
  const { productPriceCategories, meta, isLoading, error, fetchProductPriceCategories } =
    useProductPriceCategoryStore();

  useEffect(() => {
    if (!productPriceCategories) fetchProductPriceCategories(params);
  }, [productPriceCategories, fetchProductPriceCategories]);

  return {
    data: productPriceCategories,
    meta,
    isLoading,
    error,
    refetch: fetchProductPriceCategories,
  };
}

export function useAllProductPriceCategories() {
  const { allProductPriceCategories, isLoadingAll, error, fetchAllProductPriceCategories } =
    useProductPriceCategoryStore();

  useEffect(() => {
    if (!allProductPriceCategories) fetchAllProductPriceCategories();
  }, [allProductPriceCategories, fetchAllProductPriceCategories]);

  return {
    data: allProductPriceCategories,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllProductPriceCategories,
  };
}

export function useProductPriceCategoryById(id: number) {
  const { productPriceCategory, isFinding, error, fetchProductPriceCategory } = useProductPriceCategoryStore();

  useEffect(() => {
    fetchProductPriceCategory(id);
  }, [id]);

  return {
    data: productPriceCategory,
    isFinding,
    error,
    refetch: () => fetchProductPriceCategory(id),
  };
}
