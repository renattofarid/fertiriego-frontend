import { api } from "@/lib/config";
import {
  CATEGORY,
  type getCategoryProps,
  type CategoryResource,
  type CategoryResourceById,
  type CategoryResponse,
} from "./category.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = CATEGORY;

export async function getCategory({
  params,
}: getCategoryProps): Promise<CategoryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<CategoryResponse>(ENDPOINT, config);
  return data;
}

export async function getAllCategories(): Promise<CategoryResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<CategoryResource[]>(ENDPOINT, config);
  return data;
}

export async function findCategoryById(
  id: number
): Promise<CategoryResourceById> {
  const response = await api.get<CategoryResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeCategory(data: any): Promise<CategoryResponse> {
  const response = await api.post<CategoryResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateCategory(
  id: number,
  data: any
): Promise<CategoryResponse> {
  const response = await api.put<CategoryResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}