import { useQuery } from "@tanstack/react-query";
import {
  getIncidentsStats,
  getPunctualityReport,
  getWorkerReport,
} from "./report.actions";
import type { ReportParams } from "./report.interface";

export function useWorkerReport(id: number, params: ReportParams) {
  return useQuery({
    queryKey: ["hr-report-worker", id, params],
    queryFn: () => getWorkerReport(id, params),
    enabled: !!id && !!params.date_from && !!params.date_until,
    refetchOnWindowFocus: false,
  });
}

export function usePunctualityReport(params: ReportParams) {
  return useQuery({
    queryKey: ["hr-report-punctuality", params],
    queryFn: () => getPunctualityReport(params),
    enabled: !!params.date_from && !!params.date_until,
    refetchOnWindowFocus: false,
  });
}

export function useIncidentsStats(params: ReportParams) {
  return useQuery({
    queryKey: ["hr-report-incidents", params],
    queryFn: () => getIncidentsStats(params),
    enabled: !!params.date_from && !!params.date_until,
    refetchOnWindowFocus: false,
  });
}
