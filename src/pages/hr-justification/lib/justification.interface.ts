import type { Links, Meta } from "@/lib/pagination.interface";
import { FileCheck2 } from "lucide-react";

export const JUSTIFICATION_ROUTE = "/justificaciones";
export const JUSTIFICATION_ENDPOINT = "/hr/justifications";
export const JUSTIFICATION_QUERY_KEY = "hr-justifications";

export const JUSTIFICATION_META = {
  MODEL: {
    name: "Justificación",
    description: "Permisos, vacaciones e inasistencias justificadas del personal.",
    plural: "Justificaciones",
    gender: true,
  },
  ICON: "FileCheck2" as const,
  ICON_REACT: FileCheck2,
  ROUTE: JUSTIFICATION_ROUTE,
};

export type JustificationType =
  | "PERMISO"
  | "VACACIONES"
  | "ENFERMEDAD"
  | "FALTA_JUSTIFICADA"
  | "OTRO";

export type JustificationStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";

export interface JustificationResource {
  id: number;
  person_id: number;
  person_name: string;
  date_from: string;
  date_until: string;
  type: JustificationType;
  reason: string;
  status: JustificationStatus;
  document_path: string | null;
  requested_by: string;
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface JustificationResponse {
  data: JustificationResource[];
  links: Links;
  meta: Meta;
}

export interface CreateJustificationResponse {
  message: string;
  data: JustificationResource;
}

export interface CreateJustificationRequest {
  person_id: number;
  date_from: string;
  date_until: string;
  type: JustificationType;
  reason: string;
}

export interface ReviewJustificationRequest {
  status: Extract<JustificationStatus, "APROBADO" | "RECHAZADO">;
  review_notes?: string | null;
}

export interface GetJustificationsProps {
  params?: Record<string, unknown>;
}
