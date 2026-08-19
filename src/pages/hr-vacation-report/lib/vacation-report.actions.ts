import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import {
  VACATION_REPORT_BALANCE_ENDPOINT,
  VACATION_REPORT_REQUESTS_ENDPOINT,
  VACATION_REPORT_SCHEDULED_ENDPOINT,
  type ScheduledVacationReportResponse,
  type VacationBalanceReportResponse,
  type VacationReportParams,
  type VacationRequestsReportResponse,
} from "./vacation-report.interface";

export async function getScheduledVacationReport(
  params: VacationReportParams,
): Promise<ScheduledVacationReportResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<ScheduledVacationReportResponse>(
    VACATION_REPORT_SCHEDULED_ENDPOINT,
    config,
  );
  return data;
}

export async function getVacationBalanceReport(
  params: VacationReportParams,
): Promise<VacationBalanceReportResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<VacationBalanceReportResponse>(
    VACATION_REPORT_BALANCE_ENDPOINT,
    config,
  );
  return data;
}

export async function getVacationRequestsReport(
  params: VacationReportParams,
): Promise<VacationRequestsReportResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<VacationRequestsReportResponse>(
    VACATION_REPORT_REQUESTS_ENDPOINT,
    config,
  );
  return data;
}
