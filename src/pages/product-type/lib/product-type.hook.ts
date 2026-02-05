import { useEffect } from "react";
import { useProductTypeStore } from "./product-type.store";
import { useQuery } from "@tanstack/react-query";
import { getProductType } from "./product-type.actions";
import { PRODUCT_TYPE } from "./product-type.interface";

export function useProductType(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [PRODUCT_TYPE.QUERY_KEY, params],
    queryFn: () => getProductType({ params }),
    refetchOnWindowFocus: false,
  });
}

export function useAllProductTypes() {
  const { allProductTypes, fetchAllProductTypes, isLoadingAll } =
    useProductTypeStore();

  useEffect(() => {
    if (!allProductTypes) {
      fetchAllProductTypes();
    }
  }, [allProductTypes, fetchAllProductTypes]);

  return {
    data: allProductTypes,
    isLoading: isLoadingAll,
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
