import { api } from "@/lib/config";
import type {
  OrderResponse,
  OrderResource,
  OrderResourceById,
  CreateOrderRequest,
  UpdateOrderRequest,
  PendingDetailsResponse,
  AllPendingOrderDetailsParams,
  AllPendingOrderDetailsResponse,
} from "./order.interface";
import { ORDER_ENDPOINT, ALL_PENDING_DETAILS_ENDPOINT } from "./order.interface";

// ============================================
// ORDER - Main CRUD Actions
// ============================================

export interface GetOrdersParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  customer_id?: number;
  warehouse_id?: number;
  date_from?: string;
  date_to?: string;
}

export const getOrders = async (
  params?: GetOrdersParams
): Promise<OrderResponse> => {
  const response = await api.get<OrderResponse>(ORDER_ENDPOINT, {
    params,
  });
  return response.data;
};

export const getAllOrders = async (): Promise<OrderResource[]> => {
  const response = await api.get<OrderResource[]>(ORDER_ENDPOINT, {
    params: { all: true },
  });
  return response.data;
};

export const findOrderById = async (
  id: number
): Promise<OrderResourceById> => {
  const response = await api.get<OrderResourceById>(
    `${ORDER_ENDPOINT}/${id}`
  );
  return response.data;
};

export const storeOrder = async (
  data: CreateOrderRequest
): Promise<{ message: string; data: OrderResource }> => {
  const response = await api.post<{
    message: string;
    data: OrderResource;
  }>(ORDER_ENDPOINT, data);
  return response.data;
};

export const updateOrder = async (
  id: number,
  data: UpdateOrderRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${ORDER_ENDPOINT}/${id}`,
    data
  );
  return response.data;
};

export const deleteOrder = async (
  id: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${ORDER_ENDPOINT}/${id}`
  );
  return response.data;
};

export const getPendingOrderDetails = async (
  id: number
): Promise<PendingDetailsResponse> => {
  const response = await api.get<PendingDetailsResponse>(
    `${ORDER_ENDPOINT}/${id}/pending-details`
  );
  return response.data;
};

// Reporte de entregas pendientes: pedidos con productos pendientes de
// entrega dentro de un rango de fechas.
export const getAllPendingOrderDetails = async (
  params: AllPendingOrderDetailsParams
): Promise<AllPendingOrderDetailsResponse> => {
  const response = await api.get<AllPendingOrderDetailsResponse>(
    ALL_PENDING_DETAILS_ENDPOINT,
    { params }
  );
  return response.data;
};
