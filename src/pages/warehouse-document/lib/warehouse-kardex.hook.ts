import { useEffect } from "react";
import { useWarehouseKardexStore } from "./warehouse-kardex.store";

export function useWarehouseKardex(params?: Record<string, unknown>) {
  const { kardexList, meta, isLoading, error, fetchKardex } =
    useWarehouseKardexStore();

  useEffect(() => {
    if (!kardexList) fetchKardex(params);
  }, [kardexList, fetchKardex]);

  return {
    data: kardexList,
    meta,
    isLoading,
    error,
    refetch: fetchKardex,
  };
}

export function useKardexByProduct(productId: number) {
  const { kardexByProduct, isLoadingProduct, error, fetchKardexByProduct } =
    useWarehouseKardexStore();

  useEffect(() => {
    fetchKardexByProduct(productId);
  }, [productId]);

  return {
    data: kardexByProduct,
    isLoading: isLoadingProduct,
    error,
    refetch: () => fetchKardexByProduct(productId),
  };
}

export function useValuatedInventory(params?: Record<string, unknown>) {
  const { valuatedInventory, meta, isLoadingInventory, error, fetchValuatedInventory } =
    useWarehouseKardexStore();

  useEffect(() => {
    if (!valuatedInventory) fetchValuatedInventory(params);
  }, [valuatedInventory, fetchValuatedInventory]);

  return {
    data: valuatedInventory,
    meta,
    isLoading: isLoadingInventory,
    error,
    refetch: fetchValuatedInventory,
  };
}
