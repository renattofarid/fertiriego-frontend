import type { Links, Meta } from "@/lib/pagination.interface";
import { Timer } from "lucide-react";

export const OVERTIME_ROUTE = "/horas-extras";

export const OVERTIME_ENDPOINT = "/overtime";
export const OVERTIME_DETECT_ENDPOINT = `${OVERTIME_ENDPOINT}/detect`;
export const OVERTIME_REVIEW_BULK_ENDPOINT = `${OVERTIME_ENDPOINT}/review-bulk`;
export const OVERTIME_SCHEDULE_RATE_ENDPOINT = (id: number) =>
  `${OVERTIME_ENDPOINT}/schedules/${id}/rate`;
export const OVERTIME_WORKER_RATE_ENDPOINT = `${OVERTIME_ENDPOINT}/workers/rate`;

export const OVERTIME_QUERY_KEY = "overtime";

export const OVERTIME_META = {
  MODEL: {
    name: "Hora Extra",
    description: "Detección, cálculo y aprobación de horas extras del personal.",
    plural: "Horas Extras",
    gender: true,
  },
  ICON: "Timer" as const,
  ICON_REACT: Timer,
  ROUTE: OVERTIME_ROUTE,
};

export type OvertimeStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";

export interface OvertimeSchedule {
  id: number;
  name: string;
}

export interface OvertimeResource {
  id: number;
  person_id: number;
  person_name: string;
  date: string;
  schedule: OvertimeSchedule | null;
  scheduled_minutes: number;
  minutes_worked: number;
  overtime_minutes: number;
  overtime_hours: number;
  hourly_rate: string;
  rate_factor: string;
  amount: string;
  status: OvertimeStatus;
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  payroll_id: number | null;
  created_at: string;
}

export interface OvertimeResponse {
  data: OvertimeResource[];
  links: Links;
  meta: Meta;
}

export interface GetOvertimesProps {
  params?: Record<string, unknown>;
}

export interface DetectOvertimeRequest {
  date_from: string;
  date_until: string;
  person_id?: number | null;
}

export interface DetectOvertimeResponse {
  message: string;
  data: OvertimeResource[];
}

export interface ReviewOvertimeRequest {
  status: Extract<OvertimeStatus, "APROBADO" | "RECHAZADO">;
  review_notes?: string | null;
}

export interface ReviewOvertimeResponse {
  message: string;
  data: OvertimeResource;
}

export interface ReviewBulkOvertimeRequest {
  status: Extract<OvertimeStatus, "APROBADO" | "RECHAZADO">;
  review_notes?: string | null;
  ids: number[];
}

export interface ReviewBulkOvertimeResponse {
  message: string;
  data?: OvertimeResource[];
}

export interface SetScheduleOvertimeRateRequest {
  overtime_rate: number;
}

export interface SetScheduleOvertimeRateResponse {
  message: string;
  data: {
    id: number;
    overtime_rate: number;
  };
}

export interface SetWorkerOvertimeRateRequest {
  person_id: number;
  overtime_rate_override: number | null;
}

export interface SetWorkerOvertimeRateResponse {
  message: string;
  data: {
    person_id: number;
    overtime_rate_override: number | null;
  };
}
