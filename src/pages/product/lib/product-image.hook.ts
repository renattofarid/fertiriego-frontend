import { useEffect } from "react";
import { useProductImageStore } from "./product-image.store";
import type { GetProductImagesProps } from "./product.interface";

export function useProductImages(params: GetProductImagesProps) {
  const {
    productImages,
    meta,
    isLoading,
    error,
    fetchProductImages,
  } = useProductImageStore();

  useEffect(() => {
    if (params.productId && params.productId > 0) {
      fetchProductImages(params);
    }
  }, [params.productId, fetchProductImages]);

  return {
    data: productImages ? { data: productImages, meta } : null,
    isLoading,
    error,
    refetch: () => fetchProductImages(params),
  };
}

export function useProductImageById(id: number) {
  const {
    productImage,
    isFinding,
    error,
    fetchProductImageById,
  } = useProductImageStore();

  useEffect(() => {
    if (id) {
      fetchProductImageById(id);
    }
  }, [id, fetchProductImageById]);

  return {
    data: productImage,
    isFinding,
    error,
    refetch: () => fetchProductImageById(id),
  };
}