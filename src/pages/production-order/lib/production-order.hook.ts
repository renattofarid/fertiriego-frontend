import { useEffect } from "react";
import { useProductionOrderStore } from "./production-order.store";
import type { GetProductionOrdersParams } from "./production-order.interface";

export function useProductionOrders(params?: GetProductionOrdersParams) {
  const { orders, meta, isLoading, error, fetchOrders } = useProductionOrderStore();

  const page = params?.page;
  const per_page = params?.per_page;

  useEffect(() => {
    fetchOrders(params);
  }, [page, per_page, fetchOrders]);

  return {
    data: orders,
    meta,
    isLoading,
    error,
    refetch: fetchOrders,
  };
}

export function useProductionOrderById(id: number) {
  const { order, isFinding, error, fetchOrder } = useProductionOrderStore();

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id, fetchOrder]);

  return {
    data: order,
    isFinding,
    error,
    refetch: () => fetchOrder(id),
  };
}
