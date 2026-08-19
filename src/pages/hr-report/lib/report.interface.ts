import { BarChart3 } from "lucide-react";

export const REPORT_WORKER_ENDPOINT = "/hr/reports/worker";
export const REPORT_PUNCTUALITY_ENDPOINT = "/hr/reports/punctuality";
export const REPORT_INCIDENTS_ENDPOINT = "/hr/reports/incidents";

export const PUNCTUALITY_ROUTE = "/reportes/puntualidad";

export const PUNCTUALITY_META = {
  MODEL: {
    name: "Reporte de Puntualidad",
    description: "Estadísticas de puntualidad y asistencia del personal.",
    plural: "Reportes de Puntualidad",
    gender: true,
  },
  ICON: "BarChart3" as const,
  ICON_REACT: BarChart3,
  ROUTE: PUNCTUALITY_ROUTE,
};

export interface WorkerReportScheduleInfo {
  name: string;
  check_in_time: string;
  check_out_time: string;
}

export interface WorkerReportDetail {
  date: string;
  status: string;
  first_check_in: string | null;
  last_check_out: string | null;
  hours_worked: string;
  late_minutes: number;
  schedule: WorkerReportScheduleInfo | null;
}

export interface WorkerReportSummary {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  justified_days: number;
  total_hours_worked: string;
  total_late_minutes: number;
  punctuality_rate: number;
}

export interface WorkerReportResponse {
  message: string;
  data: {
    worker: { id: number; full_name: string };
    period: { from: string; until: string };
    summary: WorkerReportSummary;
    detail: WorkerReportDetail[];
  };
}

export interface PunctualityIncident {
  date: string;
  status: string;
  late_minutes: number;
  check_in: string | null;
}

export interface PunctualityWorkerRow {
  worker: { id: number; full_name: string };
  late_count: number;
  absent_count: number;
  half_day_count: number;
  justified_count: number;
  total_late_minutes: number;
  incidents: PunctualityIncident[];
}

export interface PunctualityReportResponse {
  message: string;
  data: PunctualityWorkerRow[];
  total: number;
}

export interface IncidentsStatsResponse {
  message: string;
  data: {
    period: { from: string; until: string };
    totals: {
      present: number;
      late: number;
      absent: number;
      justified: number;
      half_day: number;
    };
    percentages: {
      present: number;
      late: number;
      absent: number;
      justified: number;
      half_day: number;
    };
    hours: {
      total_worked: string;
      total_late: string;
      avg_late_minutes: number;
    };
  };
}

export interface ReportParams {
  date_from: string;
  date_until: string;
  person_id?: number;
}
