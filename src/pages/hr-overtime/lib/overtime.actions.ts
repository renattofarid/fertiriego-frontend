import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  OVERTIME_ENDPOINT,
  OVERTIME_DETECT_ENDPOINT,
  OVERTIME_REVIEW_BULK_ENDPOINT,
  OVERTIME_SCHEDULE_RATE_ENDPOINT,
  OVERTIME_WORKER_RATE_ENDPOINT,
  type GetOvertimesProps,
  type OvertimeResponse,
  type DetectOvertimeRequest,
  type DetectOvertimeResponse,
  type ReviewOvertimeRequest,
  type ReviewOvertimeResponse,
  type ReviewBulkOvertimeRequest,
  type ReviewBulkOvertimeResponse,
  type SetScheduleOvertimeRateRequest,
  type SetScheduleOvertimeRateResponse,
  type SetWorkerOvertimeRateRequest,
  type SetWorkerOvertimeRateResponse,
} from "./overtime.interface";

export async function getOvertimes({
  params,
}: GetOvertimesProps): Promise<OvertimeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<OvertimeResponse>(OVERTIME_ENDPOINT, config);
  return data;
}

export async function detectOvertime(
  data: DetectOvertimeRequest,
): Promise<DetectOvertimeResponse> {
  const response = await api.post<DetectOvertimeResponse>(
    OVERTIME_DETECT_ENDPOINT,
    data,
  );
  return response.data;
}

export async function reviewOvertime(
  id: number,
  data: ReviewOvertimeRequest,
): Promise<ReviewOvertimeResponse> {
  const response = await api.patch<ReviewOvertimeResponse>(
    `${OVERTIME_ENDPOINT}/${id}/review`,
    data,
  );
  return response.data;
}

export async function reviewBulkOvertime(
  data: ReviewBulkOvertimeRequest,
): Promise<ReviewBulkOvertimeResponse> {
  const response = await api.patch<ReviewBulkOvertimeResponse>(
    OVERTIME_REVIEW_BULK_ENDPOINT,
    data,
  );
  return response.data;
}

export async function setScheduleOvertimeRate(
  id: number,
  data: SetScheduleOvertimeRateRequest,
): Promise<SetScheduleOvertimeRateResponse> {
  const response = await api.patch<SetScheduleOvertimeRateResponse>(
    OVERTIME_SCHEDULE_RATE_ENDPOINT(id),
    data,
  );
  return response.data;
}

export async function setWorkerOvertimeRate(
  data: SetWorkerOvertimeRateRequest,
): Promise<SetWorkerOvertimeRateResponse> {
  const response = await api.patch<SetWorkerOvertimeRateResponse>(
    OVERTIME_WORKER_RATE_ENDPOINT,
    data,
  );
  return response.data;
}
