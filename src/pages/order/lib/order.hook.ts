import { useEffect } from "react";
import { useOrderStore } from "./order.store";
import type { GetOrdersParams } from "./order.actions";

export function useOrder(params?: GetOrdersParams) {
  const { orders, meta, isLoading, error, fetchOrders } = useOrderStore();

  useEffect(() => {
    if (!orders) fetchOrders(params);
  }, [orders, fetchOrders]);

  return {
    data: orders,
    meta,
    isLoading,
    error,
    refetch: fetchOrders,
  };
}

export function useAllOrders() {
  const { allOrders, isLoadingAll, error, fetchAllOrders } = useOrderStore();

  useEffect(() => {
    if (!allOrders) fetchAllOrders();
  }, [allOrders, fetchAllOrders]);

  return {
    data: allOrders,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllOrders,
  };
}

export function useOrderById(id: number) {
  const { order, isFinding, error, fetchOrder } = useOrderStore();

  useEffect(() => {
    fetchOrder(id);
  }, [id]);

  return {
    data: order,
    isFinding,
    error,
    refetch: () => fetchOrder(id),
  };
}
