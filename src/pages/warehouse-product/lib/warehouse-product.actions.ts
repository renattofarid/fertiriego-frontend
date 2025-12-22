import { api } from "@/lib/config";
import {
  WAREHOUSE_PRODUCT,
  type getWarehouseProductProps,
  type WarehouseProductResource,
  type WarehouseProductResourceById,
  type WarehouseProductResponse,
} from "./warehouse-product.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = WAREHOUSE_PRODUCT;

export async function getWarehouseProduct({
  params,
}: getWarehouseProductProps): Promise<WarehouseProductResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<WarehouseProductResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWarehouseProducts(params?: Record<string, any>): Promise<WarehouseProductResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<WarehouseProductResource[]>(ENDPOINT, config);
  return data;
}

export async function findWarehouseProductById(
  id: number
): Promise<WarehouseProductResourceById> {
  const response = await api.get<WarehouseProductResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeWarehouseProduct(data: any): Promise<WarehouseProductResponse> {
  const response = await api.post<WarehouseProductResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateWarehouseProduct(
  id: number,
  data: any
): Promise<WarehouseProductResponse> {
  const response = await api.put<WarehouseProductResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteWarehouseProduct(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
