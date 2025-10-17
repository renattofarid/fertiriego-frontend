import { useEffect } from "react";
import { usePurchaseOrderStore } from "./purchase-order.store";

export function usePurchaseOrder(params?: Record<string, unknown>) {
  const { purchaseOrders, meta, isLoading, error, fetchPurchaseOrders } =
    usePurchaseOrderStore();

  useEffect(() => {
    if (!purchaseOrders) fetchPurchaseOrders(params);
  }, [purchaseOrders, fetchPurchaseOrders]);

  return {
    data: purchaseOrders,
    meta,
    isLoading,
    error,
    refetch: fetchPurchaseOrders,
  };
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
