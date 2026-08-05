import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProductionOrderStore } from "./production-order.store";
import type { GetProductionOrdersParams } from "./production-order.interface";
import { PRODUCTION_ORDER_QUERY_KEY } from "./production-order.interface";
import { getProductionOrdersSearch } from "./production-order.actions";

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

export function useProductionOrdersSearch(params?: Record<string, any>) {
  return useQuery({
    queryKey: [PRODUCTION_ORDER_QUERY_KEY, "search", params],
    queryFn: () => getProductionOrdersSearch(params),
    refetchOnWindowFocus: false,
  });
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

export function useProductionOrdersSummary() {
  const { summary, isLoadingSummary, fetchSummary } = useProductionOrderStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data: summary, isLoading: isLoadingSummary, refetch: fetchSummary };
}

export function useProductionOrdersPending() {
  const { pending, isLoadingPending, fetchPending } = useProductionOrderStore();

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return { data: pending, isLoading: isLoadingPending, refetch: fetchPending };
}

export function useProductionOrderItemHistory(itemId: number | null) {
  const { itemHistory, isLoadingItemHistory, fetchItemHistory, resetItemHistory } =
    useProductionOrderStore();

  useEffect(() => {
    if (itemId) {
      fetchItemHistory(itemId);
    } else {
      resetItemHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  return {
    data: itemHistory,
    isLoading: isLoadingItemHistory,
    refetch: () => (itemId ? fetchItemHistory(itemId) : undefined),
  };
}
