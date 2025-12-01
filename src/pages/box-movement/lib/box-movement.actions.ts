import { api } from "@/lib/config";
import {
  BOX_MOVEMENT,
  type BoxMovementResponse,
  type BoxMovementResourceById,
  type GetBoxMovementProps,
  type CreateBoxMovementProps,
} from "./box-movement.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = BOX_MOVEMENT;

export async function getBoxMovements({
  params,
}: GetBoxMovementProps = {}): Promise<BoxMovementResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: params?.per_page || DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<BoxMovementResponse>(ENDPOINT, config);
  return data;
}

export async function findBoxMovementById(id: number): Promise<BoxMovementResourceById> {
  const response = await api.get<BoxMovementResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeBoxMovement(data: CreateBoxMovementProps): Promise<BoxMovementResourceById> {
  const response = await api.post<BoxMovementResourceById>(ENDPOINT, data);
  return response.data;
}

export async function deleteBoxMovement(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
