import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useOrderStore } from "./order.store";
import {
  getOrders,
  getAllPendingOrderDetails,
  type GetOrdersParams,
} from "./order.actions";
import { ORDER, type AllPendingOrderDetailsParams } from "./order.interface";

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

export function useOrderPendingReport(params: AllPendingOrderDetailsParams) {
  const query = useQuery({
    queryKey: [QUERY_KEY, "all-pending-details", params],
    queryFn: () => getAllPendingOrderDetails(params),
    enabled: Boolean(params.startDate && params.endDate),
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
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
