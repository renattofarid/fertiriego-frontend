import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Clock } from "lucide-react";

const ROUTE = "/horarios";
const NAME = "Horario";

export const SCHEDULE: ModelComplete<ScheduleResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de horarios de trabajo del personal.",
    plural: "Horarios",
    gender: false,
  },
  ICON: "Clock",
  ICON_REACT: Clock,
  ENDPOINT: "/hr/schedules",
  QUERY_KEY: "hr-schedules",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para crear un nuevo ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos para modificar el ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar el ${NAME.toLowerCase()}`,
    },
  },
  EMPTY: {
    id: 0,
    name: "",
    check_in_time: "",
    check_out_time: "",
    tolerance_minutes: 5,
    min_hours: 8,
    is_active: true,
    created_at: "",
  },
};

export interface ScheduleResource {
  id: number;
  name: string;
  check_in_time: string;
  check_out_time: string;
  tolerance_minutes: number;
  min_hours: number;
  is_active: boolean;
  created_at: string;
}

export interface ScheduleResponse {
  data: ScheduleResource[];
  links: Links;
  meta: Meta;
}

export interface CreateScheduleRequest {
  name: string;
  check_in_time: string;
  check_out_time: string;
  tolerance_minutes: number;
  min_hours: number;
  is_active: boolean;
}

export interface GetScheduleProps {
  params?: Record<string, unknown>;
}

export interface AssignScheduleRequest {
  person_id: number;
  work_schedule_id: number;
  valid_from: string;
  valid_until: string | null;
}

export interface AssignScheduleResource {
  id: number;
  person_id: number;
  work_schedule_id: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AssignScheduleResponse {
  message: string;
  data: AssignScheduleResource;
}
