import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePurchaseOrderStore } from "./purchase-order.store";
import { PURCHASE_ORDER } from "./purchase-order.interface";
import { getPurchaseOrders } from "./purchase-order.actions";

const { QUERY_KEY } = PURCHASE_ORDER;

export function usePurchaseOrder(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () =>
      getPurchaseOrders({
        params: {
          ...params,
        },
      }),
  });
}

export function useAllPurchaseOrders() {
  const { allPurchaseOrders, isLoadingAll, error, fetchAllPurchaseOrders } =
    usePurchaseOrderStore();

  useEffect(() => {
    if (!allPurchaseOrders) fetchAllPurchaseOrders();
  }, [allPurchaseOrders, fetchAllPurchaseOrders]);

  return {
    data: allPurchaseOrders,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllPurchaseOrders,
  };
}

export function usePurchaseOrderById(id: number) {
  const { purchaseOrder, isFinding, error, fetchPurchaseOrder } =
    usePurchaseOrderStore();

  useEffect(() => {
    fetchPurchaseOrder(id);
  }, [id, fetchPurchaseOrder]);

  return {
    data: purchaseOrder,
    isFinding,
    error,
    refetch: () => fetchPurchaseOrder(id),
  };
}
