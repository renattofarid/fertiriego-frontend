import { useEffect } from "react";
import { useWarehouseProductStore } from "./warehouse-product.store";
import { useQuery } from "@tanstack/react-query";
import { getWarehouseProduct } from "./warehouse-product.actions";
import { WAREHOUSE_PRODUCT } from "./warehouse-product.interface";

export function useWarehouseProduct(params?: Record<string, unknown>) {
  const { warehouseProducts, meta, isLoading, error, fetchWarehouseProducts } =
    useWarehouseProductStore();

  useEffect(() => {
    if (!warehouseProducts) fetchWarehouseProducts(params);
  }, [warehouseProducts, fetchWarehouseProducts]);

  return {
    data: warehouseProducts,
    meta,
    isLoading,
    error,
    refetch: fetchWarehouseProducts,
  };
}

export function useWarehouseProducts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [WAREHOUSE_PRODUCT.QUERY_KEY, params],
    queryFn: () => getWarehouseProduct({ params }),
    refetchOnWindowFocus: false,
  });
}

export function useAllWarehouseProducts(params?: Record<string, unknown>) {
  const { allWarehouseProducts, isLoadingAll, error, fetchAllWarehouseProducts } =
    useWarehouseProductStore();

  useEffect(() => {
    fetchAllWarehouseProducts(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return {
    data: allWarehouseProducts,
    isLoading: isLoadingAll,
    error,
    refetch: () => fetchAllWarehouseProducts(params),
  };
}

export function useWarehouseProductById(id: number) {
  const { warehouseProduct, isFinding, error, fetchWarehouseProduct } = useWarehouseProductStore();

  useEffect(() => {
    fetchWarehouseProduct(id);
  }, [id]);

  return {
    data: warehouseProduct,
    isFinding,
    error,
    refetch: () => fetchWarehouseProduct(id),
  };
}
