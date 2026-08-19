import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import {
  REPORT_INCIDENTS_ENDPOINT,
  REPORT_PUNCTUALITY_ENDPOINT,
  REPORT_WORKER_ENDPOINT,
  type IncidentsStatsResponse,
  type PunctualityReportResponse,
  type ReportParams,
  type WorkerReportResponse,
} from "./report.interface";

export async function getWorkerReport(
  id: number,
  params: ReportParams,
): Promise<WorkerReportResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<WorkerReportResponse>(
    `${REPORT_WORKER_ENDPOINT}/${id}`,
    config,
  );
  return data;
}

export async function getPunctualityReport(
  params: ReportParams,
): Promise<PunctualityReportResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<PunctualityReportResponse>(
    REPORT_PUNCTUALITY_ENDPOINT,
    config,
  );
  return data;
}

export async function getIncidentsStats(
  params: ReportParams,
): Promise<IncidentsStatsResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<IncidentsStatsResponse>(
    REPORT_INCIDENTS_ENDPOINT,
    config,
  );
  return data;
}
