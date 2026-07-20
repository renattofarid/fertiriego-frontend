import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  VACATION_ENDPOINT,
  VACATION_CONTROL_ENDPOINT,
  VACATION_PERIODS_ENDPOINT,
  type ControlVacationRequest,
  type ControlVacationResponse,
  type CreateVacationRequest,
  type CreateVacationResponse,
  type GetVacationPeriodsProps,
  type GetVacationsProps,
  type ReviewVacationRequest,
  type VacationControlSummaryResponse,
  type VacationPeriodResponse,
  type VacationResponse,
} from "./vacation.interface";
import type { VacationControlSchema, VacationSchema } from "./vacation.schema";

export async function getVacations({
  params,
}: GetVacationsProps): Promise<VacationResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<VacationResponse>(VACATION_ENDPOINT, config);
  return data;
}

export async function storeVacation(
  data: VacationSchema,
): Promise<CreateVacationResponse> {
  const payload: CreateVacationRequest = {
    person_id: Number(data.person_id),
    start_date: data.start_date,
    end_date: data.end_date,
    reason: data.reason || null,
  };
  const response = await api.post<CreateVacationResponse>(
    VACATION_ENDPOINT,
    payload,
  );
  return response.data;
}

export async function reviewVacation(
  id: number,
  data: ReviewVacationRequest,
): Promise<CreateVacationResponse> {
  const response = await api.patch<CreateVacationResponse>(
    `${VACATION_ENDPOINT}/${id}/review`,
    data,
  );
  return response.data;
}

export async function storeVacationControl(
  personId: number,
  data: VacationControlSchema,
): Promise<ControlVacationResponse> {
  const payload: ControlVacationRequest = {
    person_id: personId,
    hire_date: data.hire_date || null,
    vacation_days_per_year: data.vacation_days_per_year ?? null,
  };
  const response = await api.post<ControlVacationResponse>(
    VACATION_CONTROL_ENDPOINT,
    payload,
  );
  return response.data;
}

export async function getVacationControlSummary(
  personId: number,
): Promise<VacationControlSummaryResponse> {
  const { data } = await api.get<VacationControlSummaryResponse>(
    `${VACATION_CONTROL_ENDPOINT}/${personId}`,
  );
  return data;
}

export async function getVacationPeriods({
  params,
}: GetVacationPeriodsProps): Promise<VacationPeriodResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<VacationPeriodResponse>(
    VACATION_PERIODS_ENDPOINT,
    config,
  );
  return data;
}
