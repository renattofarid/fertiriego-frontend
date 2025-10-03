import { useEffect } from "react";
import { useProductTypeStore } from "./product-type.store";

export function useProductType(params?: Record<string, unknown>) {
  const { productTypes, meta, isLoading, error, fetchProductTypes } =
    useProductTypeStore();

  useEffect(() => {
    if (!productTypes) fetchProductTypes({ ...params });
  }, [productTypes, fetchProductTypes]);

  return {
    data: productTypes,
    meta,
    isLoading,
    error,
    refetch: fetchProductTypes,
  };
}

export function useAllProductTypes() {
  const { allProductTypes, fetchAllProductTypes } = useProductTypeStore();

  useEffect(() => {
    if (!allProductTypes) {
      fetchAllProductTypes();
    }
  }, [allProductTypes, fetchAllProductTypes]);

  return {
    data: allProductTypes,
  };
}

export function useProductTypeById(id: number) {
  const { productType, isFinding, error, fetchProductType } =
    useProductTypeStore();

  useEffect(() => {
    if (id) {
      fetchProductType(id);
    }
  }, [id, fetchProductType]);

  return {
    data: productType,
    isFinding,
    error,
    refetch: () => fetchProductType(id),
  };
}
