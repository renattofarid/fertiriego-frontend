import { api } from "@/lib/config";
import {
  USERBOXASSIGNMENT,
  type getUserBoxAssignmentProps,
  type UserBoxAssignmentResource,
  type UserBoxAssignmentResourceById,
  type UserBoxAssignmentResponse,
} from "./userboxassignment.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = USERBOXASSIGNMENT;

export async function getUserBoxAssignment({
  params,
}: getUserBoxAssignmentProps): Promise<UserBoxAssignmentResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<UserBoxAssignmentResponse>(ENDPOINT, config);
  return data;
}

export async function getAllUserBoxAssignments(): Promise<UserBoxAssignmentResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<UserBoxAssignmentResource[]>(ENDPOINT, config);
  return data;
}

export async function getUserBoxAssignmentsByBoxId(boxId: number): Promise<UserBoxAssignmentResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      box_id: boxId,
    },
  };
  const { data } = await api.get<UserBoxAssignmentResource[]>(ENDPOINT, config);
  return data;
}

export async function findUserBoxAssignmentById(
  id: number
): Promise<UserBoxAssignmentResourceById> {
  const response = await api.get<UserBoxAssignmentResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeUserBoxAssignment(data: any): Promise<UserBoxAssignmentResponse> {
  const response = await api.post<UserBoxAssignmentResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateUserBoxAssignment(
  id: number,
  data: any
): Promise<UserBoxAssignmentResponse> {
  const response = await api.put<UserBoxAssignmentResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteUserBoxAssignment(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
