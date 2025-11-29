import { api } from "@/lib/config";
import {
  BOX_SHIFT,
  type BoxShiftResponse,
  type BoxShiftResourceById,
  type GetBoxShiftProps,
  type CreateBoxShiftProps,
  type CloseBoxShiftProps,
} from "./box-shift.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = BOX_SHIFT;

export async function getBoxShifts({
  params,
}: GetBoxShiftProps = {}): Promise<BoxShiftResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: params?.per_page || DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<BoxShiftResponse>(ENDPOINT, config);
  return data;
}

export async function findBoxShiftById(id: number): Promise<BoxShiftResourceById> {
  const response = await api.get<BoxShiftResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeBoxShift(data: CreateBoxShiftProps): Promise<BoxShiftResourceById> {
  const response = await api.post<BoxShiftResourceById>(ENDPOINT, data);
  return response.data;
}

export async function closeBoxShift(data: CloseBoxShiftProps): Promise<BoxShiftResourceById> {
  const response = await api.post<BoxShiftResourceById>(`${ENDPOINT}/close`, data);
  return response.data;
}

export async function deleteBoxShift(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
