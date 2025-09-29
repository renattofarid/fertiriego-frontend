import { useEffect } from "react";
import { useProductStore } from "./product.store";

export function useProduct(params?: Record<string, any>) {
  const { products, meta, isLoading, error, fetchProducts } =
    useProductStore();

  useEffect(() => {
    if (!products) fetchProducts(params);
  }, [products, fetchProducts]);

  return {
    data: products,
    meta,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}

export function useAllProducts() {
  const { allProducts, isLoadingAll, error, fetchAllProducts } =
    useProductStore();

  useEffect(() => {
    if (!allProducts) fetchAllProducts();
  }, [allProducts, fetchAllProducts]);

  return {
    data: allProducts,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllProducts,
  };
}

export function useProductById(id: number) {
  const { product, isFinding, error, fetchProduct } = useProductStore();

  useEffect(() => {
    fetchProduct(id);
  }, [id]);

  return {
    data: product,
    isFinding,
    error,
    refetch: () => fetchProduct(id),
  };
}