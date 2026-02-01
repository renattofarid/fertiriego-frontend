import { useEffect } from "react";
import { useProductStore } from "./product.store";
import { getAllProducts, getProduct } from "./product.actions";
import { PRODUCT } from "./product.interface";
import { useQuery } from "@tanstack/react-query";

export function useProduct(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [PRODUCT.QUERY_KEY, params],
    queryFn: () => getProduct({ params }),
    refetchOnWindowFocus: false,
  });
}

export function useAllProducts() {
  return useQuery({
    queryKey: [PRODUCT.QUERY_KEY],
    queryFn: () => getAllProducts(),
    refetchOnWindowFocus: false,
  });
}

export function useProductById(id: number) {
  const { product, isFinding, error, fetchProduct } = useProductStore();

  useEffect(() => {
    fetchProduct(id);
  }, [id, fetchProduct]);

  return {
    data: product,
    isFinding,
    error,
    refetch: () => fetchProduct(id),
  };
}
