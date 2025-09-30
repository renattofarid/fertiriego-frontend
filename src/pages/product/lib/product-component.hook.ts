import { useEffect } from "react";
import { useProductComponentStore } from "./product-component.store";
import type { GetProductComponentsProps } from "./product.interface";

export function useProductComponents(params: GetProductComponentsProps) {
  const {
    productComponents,
    meta,
    isLoading,
    error,
    fetchProductComponents,
  } = useProductComponentStore();

  useEffect(() => {
    if (params.productId && params.productId > 0) {
      fetchProductComponents(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.productId, fetchProductComponents]);

  return {
    data: productComponents ? { data: productComponents, meta } : null,
    isLoading,
    error,
    refetch: () => fetchProductComponents(params),
  };
}

export function useProductComponentById(id: number) {
  const {
    productComponent,
    isFinding,
    error,
    fetchProductComponentById,
  } = useProductComponentStore();

  useEffect(() => {
    if (id) {
      fetchProductComponentById(id);
    }
  }, [id, fetchProductComponentById]);

  return {
    data: productComponent,
    isFinding,
    error,
    refetch: () => fetchProductComponentById(id),
  };
}