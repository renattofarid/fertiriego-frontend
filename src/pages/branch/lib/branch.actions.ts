import { api } from "@/lib/config";
import {
  BRANCH,
  type getBranchProps,
  type BranchResource,
  type BranchResourceById,
  type BranchResponse,
} from "./branch.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = BRANCH;

export async function getBranch({
  params,
}: getBranchProps): Promise<BranchResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<BranchResponse>(ENDPOINT, config);
  return data;
}

export async function getAllBranches(): Promise<BranchResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<BranchResource[]>(ENDPOINT, config);
  return data;
}

export async function findBranchById(
  id: number
): Promise<BranchResourceById> {
  const response = await api.get<BranchResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeBranch(data: any): Promise<BranchResponse> {
  const response = await api.post<BranchResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateBranch(
  id: number,
  data: any
): Promise<BranchResponse> {
  const response = await api.put<BranchResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteBranch(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}