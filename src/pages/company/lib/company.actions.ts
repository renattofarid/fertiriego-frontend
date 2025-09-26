import { api } from "@/lib/config";
import {
  COMPANY,
  type getCompanyProps,
  type CompanyResource,
  type CompanyResourceById,
  type CompanyResponse,
} from "./company.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = COMPANY;

export async function getCompany({
  params,
}: getCompanyProps): Promise<CompanyResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<CompanyResponse>(ENDPOINT, config);
  return data;
}

export async function getAllCompanies(): Promise<CompanyResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<CompanyResource[]>(ENDPOINT, config);
  return data;
}

export async function findCompanyById(
  id: number
): Promise<CompanyResourceById> {
  const response = await api.get<CompanyResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeCompany(data: any): Promise<CompanyResponse> {
  const response = await api.post<CompanyResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateCompany(
  id: number,
  data: any
): Promise<CompanyResponse> {
  const response = await api.put<CompanyResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteCompany(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}