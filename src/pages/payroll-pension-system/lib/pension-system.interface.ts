import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Landmark } from "lucide-react";

const ROUTE = "/planillas/sistemas-pension";
const NAME = "Sistema de Pensión";

export const PENSION_SYSTEM: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de los sistemas de pensión (AFP, ONP, etc.).",
    plural: "Sistemas de Pensión",
    gender: false,
  },
  ICON: "Landmark",
  ICON_REACT: Landmark,
  ENDPOINT: "/payroll/hr/pension-systems",
  QUERY_KEY: "payroll-pension-systems",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para registrar un nuevo ${NAME.toLowerCase()}`,
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
  EMPTY: {},
};

export type PensionSystemType = "ONP" | "AFP";

export const PENSION_SYSTEM_TYPE_OPTIONS: {
  value: PensionSystemType;
  label: string;
}[] = [
  { value: "ONP", label: "ONP" },
  { value: "AFP", label: "AFP" },
];

export interface PensionSystemResource {
  id: number;
  type: string;
  name: string;
  rate: number | string;
  insurance_rate: number | string;
  admin_fee_rate: number | string;
  total_rate: string;
  is_active: boolean;
  created_at: string;
}

export interface PensionSystemResponse {
  data: PensionSystemResource[];
  links: Links;
  meta: Meta;
}

export interface PensionSystemRequest {
  type: PensionSystemType;
  name: string;
  rate: number;
  insurance_rate: number;
  admin_fee_rate: number;
  is_active: boolean;
}

export interface PensionSystemItemResponse {
  message: string;
  data: PensionSystemResource;
}

export interface DeletePensionSystemResponse {
  message: string;
  data: boolean;
}

export interface GetPensionSystemsProps {
  params?: Record<string, unknown>;
}
