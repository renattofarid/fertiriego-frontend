import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  ATTENDANCE_LOG_ENDPOINT,
  ATTENDANCE_LOGS_ENDPOINT,
  type AttendanceLogResponse,
  type CreateAttendanceLogRequest,
  type CreateAttendanceLogResponse,
  type GetAttendanceLogsProps,
} from "./attendance.interface";

export async function getAttendanceLogs({
  params,
}: GetAttendanceLogsProps): Promise<AttendanceLogResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<AttendanceLogResponse>(
    ATTENDANCE_LOGS_ENDPOINT,
    config,
  );
  return data;
}

export async function storeAttendanceLog(
  data: CreateAttendanceLogRequest,
): Promise<CreateAttendanceLogResponse> {
  const response = await api.post<CreateAttendanceLogResponse>(
    ATTENDANCE_LOG_ENDPOINT,
    data,
  );
  return response.data;
}
