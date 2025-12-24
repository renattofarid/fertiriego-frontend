import { api } from "@/lib/config";
import {
  PRODUCT_PRICE_CATEGORY,
  type getProductPriceCategoryProps,
  type ProductPriceCategoryResource,
  type ProductPriceCategoryResourceById,
  type ProductPriceCategoryResponse,
} from "./product-price-category.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = PRODUCT_PRICE_CATEGORY;

export async function getProductPriceCategory({
  params,
}: getProductPriceCategoryProps): Promise<ProductPriceCategoryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<ProductPriceCategoryResponse>(ENDPOINT, config);
  return data;
}

export async function getAllProductPriceCategories(): Promise<ProductPriceCategoryResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<ProductPriceCategoryResource[]>(ENDPOINT, config);
  return data;
}

export async function findProductPriceCategoryById(
  id: number
): Promise<ProductPriceCategoryResourceById> {
  const response = await api.get<ProductPriceCategoryResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeProductPriceCategory(data: any): Promise<ProductPriceCategoryResponse> {
  const response = await api.post<ProductPriceCategoryResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateProductPriceCategory(
  id: number,
  data: any
): Promise<ProductPriceCategoryResponse> {
  const response = await api.put<ProductPriceCategoryResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteProductPriceCategory(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
