import { api } from "@/lib/config";
import {
  PRODUCT,
  type getProductProps,
  type ProductResource,
  type ProductResourceById,
  type ProductResponse,
  type DeleteTechnicalSheetRequest,
} from "./product.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = PRODUCT;

export async function getProduct({
  params,
}: getProductProps): Promise<ProductResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<ProductResponse>(ENDPOINT, config);
  return data;
}

export async function getAllProducts(): Promise<ProductResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<ProductResource[]>(ENDPOINT, config);
  return data;
}

export async function findProductById(
  id: number
): Promise<ProductResourceById> {
  const response = await api.get<ProductResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeProduct(data: FormData): Promise<ProductResponse> {
  const response = await api.post<ProductResponse>(ENDPOINT, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateProduct(
  id: number,
  data: FormData
): Promise<ProductResponse> {
  // Para el update usamos POST con _method=PUT como mencionaste
  const response = await api.post<ProductResponse>(`${ENDPOINT}/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function deleteProduct(id: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
  return data;
}

export async function deleteTechnicalSheet(
  productId: number,
  request: DeleteTechnicalSheetRequest
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `${ENDPOINT}/${productId}/technical-sheet`,
    { data: request }
  );
  return data;
}
