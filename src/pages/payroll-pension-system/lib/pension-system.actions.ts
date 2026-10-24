import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  PENSION_SYSTEM,
  type PensionSystemResponse,
  type PensionSystemRequest,
  type PensionSystemItemResponse,
  type DeletePensionSystemResponse,
  type GetPensionSystemsProps,
} from "./pension-system.interface";

const { ENDPOINT } = PENSION_SYSTEM;

export async function getPensionSystems({
  params,
}: GetPensionSystemsProps = {}): Promise<PensionSystemResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<PensionSystemResponse>(ENDPOINT, config);
  return data;
}

export async function storePensionSystem(
  data: PensionSystemRequest,
): Promise<PensionSystemItemResponse> {
  const response = await api.post<PensionSystemItemResponse>(ENDPOINT, data);
  return response.data;
}

export async function updatePensionSystem(
  id: number,
  data: PensionSystemRequest,
): Promise<PensionSystemItemResponse> {
  const response = await api.put<PensionSystemItemResponse>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

export async function deletePensionSystem(
  id: number,
): Promise<DeletePensionSystemResponse> {
  const { data } = await api.delete<DeletePensionSystemResponse>(
    `${ENDPOINT}/${id}`,
  );
  return data;
}
