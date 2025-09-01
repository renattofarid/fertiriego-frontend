import { api } from "@/lib/config";
import type {
  getTypeUserProps,
  TypeUserResource,
  TypeUserResourceById,
  TypeUserResponse,
} from "./typeUser.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const ENDPOINT = "tipo-usuarios";

export async function getTypeUser({
  params,
}: getTypeUserProps): Promise<TypeUserResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<TypeUserResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTypeUsers(): Promise<TypeUserResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all typeUsers
    },
  };
  const { data } = await api.get<TypeUserResource[]>(ENDPOINT, config);
  return data;
}

export async function findTypeUserById(
  id: number
): Promise<TypeUserResourceById> {
  const response = await api.get<TypeUserResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTypeUser(data: any): Promise<TypeUserResponse> {
  const response = await api.post<TypeUserResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateTypeUser(
  id: number,
  data: any
): Promise<TypeUserResponse> {
  const response = await api.put<TypeUserResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteTypeUser(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
