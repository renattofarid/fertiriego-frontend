import { api } from "@/lib/config";
import {
  type BoxDailyBalanceResponse,
  type GetBoxDailyBalanceProps,
  type CreateBoxDailyBalanceProps,
  type BoxDailyBalanceResourceById,
} from "./box-daily-balance.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const ENDPOINT = "/box-daily-balances";

export async function getBoxDailyBalances({
  params,
}: GetBoxDailyBalanceProps = {}): Promise<BoxDailyBalanceResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: params?.per_page || DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<BoxDailyBalanceResponse>(ENDPOINT, config);
  return data;
}

export async function createBoxDailyBalance(
  data: CreateBoxDailyBalanceProps
): Promise<BoxDailyBalanceResourceById> {
  const response = await api.post<BoxDailyBalanceResourceById>(ENDPOINT, data);
  return response.data;
}
