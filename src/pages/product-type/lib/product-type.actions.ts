import { api } from "@/lib/config";
import {
  PRODUCT_TYPE,
  type getProductTypeProps,
  type ProductTypeResource,
  type ProductTypeResourceById,
  type ProductTypeResponse,
} from "./product-type.interface";
import type { ProductTypeSchema } from "./product-type.schema";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = PRODUCT_TYPE;

export async function getProductType({
  params,
}: getProductTypeProps): Promise<ProductTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<ProductTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllProductTypes(): Promise<ProductTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<ProductTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findProductTypeById(
  id: number
): Promise<ProductTypeResourceById> {
  const response = await api.get<ProductTypeResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeProductType(
  data: ProductTypeSchema
): Promise<ProductTypeResponse> {
  const response = await api.post<ProductTypeResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateProductType(
  id: number,
  data: ProductTypeSchema
): Promise<ProductTypeResponse> {
  const response = await api.put<ProductTypeResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteProductType(
  id: number
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
  return data;
}
