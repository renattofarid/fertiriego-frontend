import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useOrderStore } from "./order.store";
import { getOrders, type GetOrdersParams } from "./order.actions";
import { ORDER } from "./order.interface";

const { QUERY_KEY } = ORDER;

export function useOrder(params?: GetOrdersParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getOrders(params),
  });
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
