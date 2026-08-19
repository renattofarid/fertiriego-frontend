import type { Links, Meta } from "@/lib/pagination.interface";
import { Palmtree, CalendarCog } from "lucide-react";

export const VACATION_ROUTE = "/vacaciones";
export const VACATION_CONTROL_ROUTE = "/vacaciones/control";

export const VACATION_ENDPOINT = "/vacations/requests";
export const VACATION_CONTROL_ENDPOINT = "/vacations/control";
export const VACATION_PERIODS_ENDPOINT = "/vacations/periods";

export const VACATION_QUERY_KEY = "vacation-requests";
export const VACATION_CONTROL_QUERY_KEY = "vacation-control";
export const VACATION_PERIODS_QUERY_KEY = "vacation-periods";

export const VACATION_META = {
  MODEL: {
    name: "Solicitud de Vacaciones",
    description: "Solicitudes de vacaciones del personal.",
    plural: "Solicitudes de Vacaciones",
    gender: true,
  },
  ICON: "Palmtree" as const,
  ICON_REACT: Palmtree,
  ROUTE: VACATION_ROUTE,
};

export const VACATION_CONTROL_META = {
  MODEL: {
    name: "Control de Vacaciones",
    description:
      "Configuración de ingreso y días anuales, y resumen de vacaciones por trabajador.",
    plural: "Controles de Vacaciones",
    gender: true,
  },
  ICON: "CalendarCog" as const,
  ICON_REACT: CalendarCog,
  ROUTE: VACATION_CONTROL_ROUTE,
};

export type VacationStatus =
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO"
  | "CANCELADO";

export interface VacationResource {
  id: number;
  person_id: number;
  person_name: string;
  period_year: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string | null;
  status: VacationStatus;
  requested_by: string;
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface VacationResponse {
  data: VacationResource[];
  links: Links;
  meta: Meta;
}

export interface CreateVacationResponse {
  message: string;
  data: VacationResource;
}

export interface CreateVacationRequest {
  person_id: number;
  start_date: string;
  end_date: string;
  reason?: string | null;
}

export interface ReviewVacationRequest {
  status: Extract<VacationStatus, "APROBADO" | "RECHAZADO" | "CANCELADO">;
  review_notes?: string | null;
}

export interface GetVacationsProps {
  params?: Record<string, unknown>;
}

export interface ControlVacationRequest {
  person_id: number;
  hire_date?: string | null;
  vacation_days_per_year?: number | null;
}

export interface ControlVacationResponse {
  message: string;
  data: {
    person_id: string;
    hire_date: string;
    years_completed: number;
    periods_created: number[];
    periods_updated: number[];
  };
}

export interface VacationPeriodSummary {
  period_year: number;
  period_start: string;
  period_end: string;
  days_entitled: number;
  days_used: number;
  days_pending: number;
  status: string;
}

export interface VacationControlSummaryResponse {
  message: string;
  data: {
    worker: {
      id: string;
      full_name: string;
      hire_date: string;
      vacation_days_per_year: string;
    };
    summary: {
      total_entitled: string;
      total_used: string;
      total_pending: string;
    };
    current_period: {
      period_year: number;
      period_start: string;
      period_end: string;
      days_entitled: number;
      days_used: number;
      days_pending: number;
    } | null;
    periods: VacationPeriodSummary[];
  };
}

export interface VacationPeriodResource {
  person_id: number;
  person_name: string;
  period_year: number;
  period_start: string;
  period_end: string;
  days_entitled: number;
  days_used: number;
  days_pending: number;
  status: string;
}

export interface VacationPeriodResponse {
  data: VacationPeriodResource[];
  links: Links;
  meta: Meta;
}

export interface GetVacationPeriodsProps {
  params?: Record<string, unknown>;
}
