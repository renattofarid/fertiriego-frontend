import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  SALARY,
  type SalaryResponse,
  type CreateSalaryRequest,
  type CreateSalaryResponse,
  type GetSalariesProps,
  type PensionSystemResponse,
  type GetPensionSystemsProps,
} from "./salary.interface";

const { ENDPOINT } = SALARY;
const PENSION_SYSTEM_ENDPOINT = "/payroll/hr/pension-systems";

export async function getSalaries({
  params,
}: GetSalariesProps = {}): Promise<SalaryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<SalaryResponse>(ENDPOINT, config);
  return data;
}

export async function storeSalary(
  data: CreateSalaryRequest,
): Promise<CreateSalaryResponse> {
  const response = await api.post<CreateSalaryResponse>(ENDPOINT, data);
  return response.data;
}

export async function getPensionSystems({
  params,
}: GetPensionSystemsProps = {}): Promise<PensionSystemResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<PensionSystemResponse>(
    PENSION_SYSTEM_ENDPOINT,
    config,
  );
  return data;
}
