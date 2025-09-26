import { api } from "@/lib/config";
import {
  WAREHOUSE,
  type getWarehouseProps,
  type WarehouseResource,
  type WarehouseResourceById,
  type WarehouseResponse,
} from "./warehouse.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = WAREHOUSE;

export async function getWarehouse({
  params,
}: getWarehouseProps): Promise<WarehouseResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<WarehouseResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWarehouses(): Promise<WarehouseResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<WarehouseResource[]>(ENDPOINT, config);
  return data;
}

export async function findWarehouseById(
  id: number
): Promise<WarehouseResourceById> {
  const response = await api.get<WarehouseResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeWarehouse(data: any): Promise<WarehouseResponse> {
  const response = await api.post<WarehouseResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateWarehouse(
  id: number,
  data: any
): Promise<WarehouseResponse> {
  const response = await api.put<WarehouseResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteWarehouse(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}