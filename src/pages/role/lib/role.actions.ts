import { api } from "@/lib/config";
import {
  ROLE,
  type GetRolesProps,
  type RoleResource,
  type RoleResourceById,
  type RoleResponse,
  type CreateRoleRequest,
  type UpdateRoleRequest,
} from "./role.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = ROLE;

export async function getRoles({
  params,
}: GetRolesProps): Promise<RoleResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<RoleResponse>(ENDPOINT, config);
  return data;
}

export async function getAllRoles(): Promise<RoleResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<RoleResource[]>(ENDPOINT, config);
  return data;
}

export async function findRoleById(
  id: number
): Promise<RoleResourceById> {
  const response = await api.get<RoleResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function createRole(
  data: CreateRoleRequest
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(ENDPOINT, data);
  return response.data;
}

export async function updateRole(
  id: number,
  data: UpdateRoleRequest
): Promise<{ message: string }> {
  const response = await api.put<{ message: string }>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteRole(id: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
  return data;
}