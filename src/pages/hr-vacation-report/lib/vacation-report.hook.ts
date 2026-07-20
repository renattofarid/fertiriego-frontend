import { useQuery } from "@tanstack/react-query";
import {
  getScheduledVacationReport,
  getVacationBalanceReport,
  getVacationRequestsReport,
} from "./vacation-report.actions";
import type { VacationReportParams } from "./vacation-report.interface";

export function useScheduledVacationReport(params: VacationReportParams) {
  return useQuery({
    queryKey: ["vacation-report-scheduled", params],
    queryFn: () => getScheduledVacationReport(params),
    refetchOnWindowFocus: false,
  });
}

export function useVacationBalanceReport(params: VacationReportParams) {
  return useQuery({
    queryKey: ["vacation-report-balance", params],
    queryFn: () => getVacationBalanceReport(params),
    refetchOnWindowFocus: false,
  });
}

export function useVacationRequestsReport(params: VacationReportParams) {
  return useQuery({
    queryKey: ["vacation-report-requests", params],
    queryFn: () => getVacationRequestsReport(params),
    refetchOnWindowFocus: false,
  });
}
