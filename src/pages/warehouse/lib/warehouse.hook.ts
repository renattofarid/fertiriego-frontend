import { useEffect } from "react";
import { useWarehouseStore } from "./warehouse.store";
import { useQuery } from "@tanstack/react-query";
import { getWarehouse } from "./warehouse.actions";
import { WAREHOUSE } from "./warehouse.interface";

export function useWarehouses(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [WAREHOUSE.QUERY_KEY, params],
    queryFn: () => getWarehouse({ params }),
  });
}

export function useWarehouse(params?: Record<string, unknown>) {
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