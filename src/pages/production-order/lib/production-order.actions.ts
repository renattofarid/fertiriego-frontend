import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import type {
  ProductionOrderResponse,
  ProductionOrderResourceById,
  CreateProductionOrderRequest,
  UpdateProductionOrderRequest,
  GetProductionOrdersParams,
} from "./production-order.interface";
import { PRODUCTION_ORDER_ENDPOINT } from "./production-order.interface";

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
