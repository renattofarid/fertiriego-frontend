import { api } from "@/lib/config";
import {
  BOX,
  type getBoxProps,
  type BoxResource,
  type BoxResourceById,
  type BoxResponse,
} from "./box.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = BOX;

export async function getBox({
  params,
}: getBoxProps): Promise<BoxResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<BoxResponse>(ENDPOINT, config);
  return data;
}

export async function getAllBoxes(): Promise<BoxResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<BoxResource[]>(ENDPOINT, config);
  return data;
}

export async function findBoxById(
  id: number
): Promise<BoxResourceById> {
  const response = await api.get<BoxResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeBox(data: any): Promise<BoxResponse> {
  const response = await api.post<BoxResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateBox(
  id: number,
  data: any
): Promise<BoxResponse> {
  const response = await api.put<BoxResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteBox(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}