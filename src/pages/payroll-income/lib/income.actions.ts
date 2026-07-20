import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  INCOME,
  type IncomeResponse,
  type CreateIncomeRequest,
  type CreateIncomeResponse,
  type DeleteIncomeResponse,
  type GetIncomesProps,
} from "./income.interface";

const { ENDPOINT } = INCOME;

export async function getIncomes({
  params,
}: GetIncomesProps = {}): Promise<IncomeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<IncomeResponse>(ENDPOINT, config);
  return data;
}

export async function storeIncome(
  data: CreateIncomeRequest,
): Promise<CreateIncomeResponse> {
  const response = await api.post<CreateIncomeResponse>(ENDPOINT, data);
  return response.data;
}

export async function deleteIncome(id: number): Promise<DeleteIncomeResponse> {
  const { data } = await api.delete<DeleteIncomeResponse>(`${ENDPOINT}/${id}`);
  return data;
}
