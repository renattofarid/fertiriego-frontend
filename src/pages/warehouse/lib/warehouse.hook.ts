import { useEffect } from "react";
import { useWarehouseStore } from "./warehouse.store";

export function useWarehouse(params?: Record<string, any>) {
  const { warehouses, meta, isLoading, error, fetchWarehouses } =
    useWarehouseStore();

  useEffect(() => {
    if (!warehouses) fetchWarehouses(params);
  }, [warehouses, fetchWarehouses]);

  return {
    data: warehouses,
    meta,
    isLoading,
    error,
    refetch: fetchWarehouses,
  };
}

export function useAllWarehouses() {
  const { allWarehouses, isLoadingAll, error, fetchAllWarehouses } =
    useWarehouseStore();

  useEffect(() => {
    if (!allWarehouses) fetchAllWarehouses();
  }, [allWarehouses, fetchAllWarehouses]);

  return {
    data: allWarehouses,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllWarehouses,
  };
}

export function useWarehouseById(id: number) {
  const { warehouse, isFinding, error, fetchWarehouse } = useWarehouseStore();

  useEffect(() => {
    fetchWarehouse(id);
  }, [id]);

  return {
    data: warehouse,
    isFinding,
    error,
    refetch: () => fetchWarehouse(id),
  };
}