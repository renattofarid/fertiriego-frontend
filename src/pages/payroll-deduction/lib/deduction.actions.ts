import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  DEDUCTION,
  type DeductionResponse,
  type CreateDeductionRequest,
  type CreateDeductionResponse,
  type DeleteDeductionResponse,
  type GetDeductionsProps,
} from "./deduction.interface";

const { ENDPOINT } = DEDUCTION;

export async function getDeductions({
  params,
}: GetDeductionsProps = {}): Promise<DeductionResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<DeductionResponse>(ENDPOINT, config);
  return data;
}

export async function storeDeduction(
  data: CreateDeductionRequest,
): Promise<CreateDeductionResponse> {
  const response = await api.post<CreateDeductionResponse>(ENDPOINT, data);
  return response.data;
}

export async function deleteDeduction(
  id: number,
): Promise<DeleteDeductionResponse> {
  const { data } = await api.delete<DeleteDeductionResponse>(
    `${ENDPOINT}/${id}`,
  );
  return data;
}
