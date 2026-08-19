import type { Links, Meta } from "@/lib/pagination.interface";
import { CalendarCheck2 } from "lucide-react";

export const ATTENDANCE_ROUTE = "/asistencias";
export const ATTENDANCE_LOG_ENDPOINT = "/hr/attendance/log";
export const ATTENDANCE_LOGS_ENDPOINT = "/hr/attendance/logs";
export const ATTENDANCE_QUERY_KEY = "hr-attendance-logs";

export const ATTENDANCE_META = {
  MODEL: {
    name: "Asistencia",
    description: "Registro de marcaciones de entrada y salida del personal.",
    plural: "Asistencias",
    gender: false,
  },
  ICON: "CalendarCheck2" as const,
  ICON_REACT: CalendarCheck2,
  ROUTE: ATTENDANCE_ROUTE,
};

export type AttendanceType = "ENTRADA" | "SALIDA";
export type AttendanceMethod = "BIOMETRICO" | "QR" | "DIGITAL";
export type AttendanceStatus =
  | "PRESENTE"
  | "TARDANZA"
  | "FALTA"
  | "JUSTIFICADO"
  | "MEDIO_DIA"
  | "DESCANSO";

export interface AttendanceLogResource {
  id: number;
  person_id: number;
  person_name: string;
  date: string;
  time: string;
  type: AttendanceType;
  method: AttendanceMethod;
  device_reference: string | null;
  notes: string | null;
  schedule: { id: number; name: string } | null;
  registered_by: string;
  created_at: string;
}

export interface AttendanceLogResponse {
  data: AttendanceLogResource[];
  links: Links;
  meta: Meta;
}

export interface CreateAttendanceLogRequest {
  person_id: number;
  type: AttendanceType;
  date: string;
  time: string;
  method: AttendanceMethod;
  device_reference?: string | null;
  notes?: string | null;
}

export interface CreateAttendanceLogResponse {
  message: string;
  data: AttendanceLogResource;
}

export interface GetAttendanceLogsProps {
  params?: Record<string, unknown>;
}
