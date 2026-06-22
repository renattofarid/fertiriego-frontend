import { api } from "@/lib/config";
import {
  PRODUCT_TAG,
  type GetTagsProps,
  type TagResource,
  type TagResourceById,
  type TagResponse,
} from "./product-tag.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = PRODUCT_TAG;

export async function getTags({ params }: GetTagsProps): Promise<TagResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: params?.per_page ?? DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<TagResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTags(): Promise<TagResource[]> {
  const config: AxiosRequestConfig = {
    params: { all: true },
  };
  const { data } = await api.get<TagResource[]>(ENDPOINT, config);
  return data;
}

export async function findTagById(id: number): Promise<TagResourceById> {
  const response = await api.get<TagResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTag(data: any): Promise<any> {
  const response = await api.post<any>(ENDPOINT, data);
  return response.data;
}

export async function updateTag(id: number, data: any): Promise<any> {
  const response = await api.put<any>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteTag(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
