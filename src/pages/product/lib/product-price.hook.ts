import { useEffect } from "react";
import { useProductPriceStore } from "./product-price.store";
import type { GetProductPricesProps } from "./product.interface";

export function useProductPrices(params: GetProductPricesProps) {
  const {
    productPrices,
    meta,
    isLoading,
    error,
    fetchProductPrices,
  } = useProductPriceStore();

  useEffect(() => {
    if (params.productId && params.productId > 0) {
      fetchProductPrices(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.productId, fetchProductPrices]);

  return {
    data: productPrices ? { data: productPrices, meta } : null,
    isLoading,
    error,
    refetch: () => fetchProductPrices(params),
  };
}

export function useProductPriceById(id: number) {
  const {
    productPrice,
    isFinding,
    error,
    fetchProductPriceById,
  } = useProductPriceStore();

  useEffect(() => {
    if (id) {
      fetchProductPriceById(id);
    }
  }, [id, fetchProductPriceById]);

  return {
    data: productPrice,
    isFinding,
    error,
    refetch: () => fetchProductPriceById(id),
  };
}