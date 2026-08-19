import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import type {
  ProductionOrderResponse,
  ProductionOrderResourceById,
  CreateProductionOrderRequest,
  UpdateProductionOrderRequest,
  GetProductionOrdersParams,
  ProductionOrderSummaryResponse,
  ProductionOrderPendingResponse,
  ProductionOrderItemHistoryResponse,
} from "./production-order.interface";
import {
  PRODUCTION_ORDER_ENDPOINT,
  PRODUCTION_ORDER_SUMMARY_ENDPOINT,
  PRODUCTION_ORDER_PENDING_ENDPOINT,
  PRODUCTION_ORDER_ITEM_HISTORY_ENDPOINT,
} from "./production-order.interface";

export async function getProductionOrders(params?: GetProductionOrdersParams) {
  const { page = 1, per_page = 15 } = params || {};
  const response = await api.get<ProductionOrderResponse>(
    `${PRODUCTION_ORDER_ENDPOINT}?page=${page}&per_page=${per_page}`
  );
  return response;
}

export async function getProductionOrdersSearch(params?: Record<string, any>): Promise<ProductionOrderResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: 15,
      status: "APROBADO",
      ...params,
    },
  };
  const { data } = await api.get<ProductionOrderResponse>(PRODUCTION_ORDER_ENDPOINT, config);
  return data;
}

export async function findProductionOrderById(id: number) {
  const response = await api.get<ProductionOrderResourceById>(
    `${PRODUCTION_ORDER_ENDPOINT}/${id}`
  );
  return response;
}

export async function storeProductionOrder(data: CreateProductionOrderRequest) {
  const response = await api.post<ProductionOrderResourceById>(
    PRODUCTION_ORDER_ENDPOINT,
    data
  );
  return response;
}

export async function updateProductionOrder(
  id: number,
  data: UpdateProductionOrderRequest
) {
  const response = await api.put<ProductionOrderResourceById>(
    `${PRODUCTION_ORDER_ENDPOINT}/${id}`,
    data
  );
  return response;
}

export async function deleteProductionOrder(id: number) {
  const response = await api.delete(`${PRODUCTION_ORDER_ENDPOINT}/${id}`);
  return response;
}

export async function submitProductionOrder(id: number) {
  const response = await api.post<ProductionOrderResourceById>(
    `${PRODUCTION_ORDER_ENDPOINT}/${id}/submit`
  );
  return response;
}

export async function approveProductionOrder(id: number) {
  const response = await api.post<ProductionOrderResourceById>(
    `${PRODUCTION_ORDER_ENDPOINT}/${id}/approve`
  );
  return response;
}

export async function rejectProductionOrder(
  id: number,
  data: { rejection_reason: string }
) {
  const response = await api.post<ProductionOrderResourceById>(
    `${PRODUCTION_ORDER_ENDPOINT}/${id}/reject`,
    data
  );
  return response;
}

export async function cancelProductionOrder(id: number) {
  const response = await api.post<ProductionOrderResourceById>(
    `${PRODUCTION_ORDER_ENDPOINT}/${id}/cancel`
  );
  return response;
}

// ✅ Resumen de órdenes por estado (tarjetas de dashboard)
export async function getProductionOrdersSummary() {
  const response = await api.get<ProductionOrderSummaryResponse>(
    PRODUCTION_ORDER_SUMMARY_ENDPOINT
  );
  return response;
}

// ✅ Reporte de órdenes/ítems pendientes a producir
export async function getProductionOrdersPending() {
  const response = await api.get<ProductionOrderPendingResponse>(
    PRODUCTION_ORDER_PENDING_ENDPOINT
  );
  return response;
}

// ✅ Historial de producción parcial de un ítem (para continuar produciendo)
export async function getProductionOrderItemHistory(itemId: number) {
  const response = await api.get<ProductionOrderItemHistoryResponse>(
    PRODUCTION_ORDER_ITEM_HISTORY_ENDPOINT(itemId)
  );
  return response;
}
