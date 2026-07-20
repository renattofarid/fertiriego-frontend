import { api } from "@/lib/config";
import {
  SCHEDULE,
  type GetScheduleProps,
  type ScheduleResponse,
  type CreateScheduleRequest,
  type AssignScheduleRequest,
  type AssignScheduleResponse,
} from "./schedule.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = SCHEDULE;

export async function getSchedules({
  params,
}: GetScheduleProps): Promise<ScheduleResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<ScheduleResponse>(ENDPOINT, config);
  return data;
}

export async function storeSchedule(
  data: CreateScheduleRequest,
): Promise<ScheduleResponse> {
  const response = await api.post<ScheduleResponse>(ENDPOINT, data);
  return response.data;
}

export async function storeAssignSchedule(
  data: AssignScheduleRequest,
): Promise<AssignScheduleResponse> {
  const response = await api.post<AssignScheduleResponse>(
    `${ENDPOINT}/assign`,
    data,
  );
  return response.data;
}
