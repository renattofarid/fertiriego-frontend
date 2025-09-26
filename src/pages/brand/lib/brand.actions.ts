import { api } from "@/lib/config";
import {
  BRAND,
  type getBrandProps,
  type BrandResource,
  type BrandResourceById,
  type BrandResponse,
} from "./brand.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = BRAND;

export async function getBrand({
  params,
}: getBrandProps): Promise<BrandResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<BrandResponse>(ENDPOINT, config);
  return data;
}

export async function getAllBrands(): Promise<BrandResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<BrandResource[]>(ENDPOINT, config);
  return data;
}

export async function findBrandById(
  id: number
): Promise<BrandResourceById> {
  const response = await api.get<BrandResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeBrand(data: any): Promise<BrandResponse> {
  const response = await api.post<BrandResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateBrand(
  id: number,
  data: any
): Promise<BrandResponse> {
  const response = await api.put<BrandResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteBrand(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}