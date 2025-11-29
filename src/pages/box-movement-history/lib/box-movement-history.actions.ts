import { api } from "@/lib/config";
import {
  type BoxMovementHistoryResponse,
  type GetBoxMovementHistoryProps,
  type GetHistoriesByMovementProps,
} from "./box-movement-history.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const ENDPOINT = "/box-movement-histories";

export async function getBoxMovementHistories({
  params,
}: GetBoxMovementHistoryProps = {}): Promise<BoxMovementHistoryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: params?.per_page || DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<BoxMovementHistoryResponse>(ENDPOINT, config);
  return data;
}

export async function getHistoriesByMovement(
  data: GetHistoriesByMovementProps
): Promise<BoxMovementHistoryResponse> {
  const response = await api.post<BoxMovementHistoryResponse>(`${ENDPOINT}/by-movement`, data);
  return response.data;
}
