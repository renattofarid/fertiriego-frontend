import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import {
  PERMISSION,
  type GetPermissionsProps,
  type PermissionResource,
  type PermissionResourceById,
  type PermissionResponse,
  type CreatePermissionRequest,
  type UpdatePermissionRequest,
} from "./permission.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = PERMISSION;

export async function getPermissions({
  params,
}: GetPermissionsProps): Promise<PermissionResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: (params?.per_page as number) ?? DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<PermissionResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPermissions(): Promise<PermissionResource[]> {
  const config: AxiosRequestConfig = {
    params: { all: true },
  };
  const { data } = await api.get<PermissionResource[]>(ENDPOINT, config);
  return data;
}

export async function findPermissionById(
  id: number
): Promise<PermissionResourceById> {
  const response = await api.get<PermissionResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function createPermission(
  data: CreatePermissionRequest
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(ENDPOINT, data);
  return response.data;
}

export async function updatePermission(
  id: number,
  data: UpdatePermissionRequest
): Promise<{ message: string }> {
  const response = await api.put<{ message: string }>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deletePermission(id: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
  return data;
}
