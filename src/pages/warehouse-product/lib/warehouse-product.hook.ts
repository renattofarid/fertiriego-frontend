import { useEffect } from "react";
import { useWarehouseProductStore } from "./warehouse-product.store";

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

export function useAllWarehouseProducts() {
  const { allWarehouseProducts, isLoadingAll, error, fetchAllWarehouseProducts } =
    useWarehouseProductStore();

  useEffect(() => {
    if (!allWarehouseProducts) fetchAllWarehouseProducts();
  }, [allWarehouseProducts, fetchAllWarehouseProducts]);

  return {
    data: allWarehouseProducts,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllWarehouseProducts,
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
