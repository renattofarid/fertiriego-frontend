import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import {
  MENU_GROUP,
  type GetMenuGroupsProps,
  type MenuGroupResource,
  type MenuGroupResourceById,
  type MenuGroupResponse,
  type CreateMenuGroupRequest,
  type UpdateMenuGroupRequest,
} from "./menuGroup.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = MENU_GROUP;

export async function getMenuGroups({
  params,
}: GetMenuGroupsProps): Promise<MenuGroupResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: (params?.per_page as number) ?? DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<MenuGroupResponse>(ENDPOINT, config);
  return data;
}

export async function getAllMenuGroups(): Promise<MenuGroupResource[]> {
  const config: AxiosRequestConfig = {
    params: { all: true },
  };
  const { data } = await api.get<MenuGroupResource[]>(ENDPOINT, config);
  return data;
}

export async function findMenuGroupById(
  id: number
): Promise<MenuGroupResourceById> {
  const response = await api.get<MenuGroupResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function createMenuGroup(
  data: CreateMenuGroupRequest
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(ENDPOINT, data);
  return response.data;
}

export async function updateMenuGroup(
  id: number,
  data: UpdateMenuGroupRequest
): Promise<{ message: string }> {
  const response = await api.put<{ message: string }>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteMenuGroup(id: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
  return data;
}
